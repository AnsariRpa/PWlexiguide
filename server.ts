/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { docStore } from "./server/docStore";
import { chunkDocumentText } from "./src/utils/chunker";
import { parsePdfBuffer } from "./server/pdfService";
import {
  analyzeDocumentWithGemini,
  analyzePersonalizedRelevance,
  answerEvidenceBackedQuestion,
  compareDocumentsWithGemini,
  generateActionableOutputsWithGemini
} from "./server/geminiService";
import { DocumentItem } from "./src/types";
import {
  requireAuth,
  AuthenticatedRequest,
  createDemoToken
} from "./server/authMiddleware";

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Increase payload limit for PDF base64 uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Intercept body-parser errors (PayloadTooLargeError or SyntaxError) to return JSON, never default Express HTML
  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    if (err) {
      if (err.type === "entity.too.large" || err.status === 413) {
        return res.status(413).json({
          error: "The uploaded file is too large. Please upload a PDF under 15MB or paste text directly."
        });
      }
      if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({
          error: "Invalid request payload format."
        });
      }
      return res.status(500).json({
        error: err.message || "Request parsing failed"
      });
    }
    next();
  });

  // --- Public API Routes ---

  // Health check (public)
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "LexiGuide API",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      authModel: "firebase_id_token",
      persistence: "firestore",
      timestamp: new Date().toISOString()
    });
  });

  // Demo session issuance for immediate interactive evaluation (public)
  app.post("/api/auth/demo-session", (_req: Request, res: Response) => {
    const demoId = `demo_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    const displayName = "Guest Reviewer";
    const token = createDemoToken(demoId, displayName);

    res.json({
      success: true,
      token,
      user: {
        uid: demoId,
        displayName,
        email: `${demoId}@lexiguide.local`,
        isDemo: true
      }
    });
  });

  // --- Protected API Routes (Requires verified Firebase ID Token) ---
  // Every route below strictly uses req.user!.uid verified by Firebase Admin SDK.

  // Get user documents
  app.get(
    "/api/documents",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const docs = await docStore.getDocuments(userId);

        res.json({
          success: true,
          documents: docs
        });
      } catch (err: any) {
        console.error("Fetch documents error:", err);

        res.status(500).json({
          error: err.message || "Failed to fetch documents"
        });
      }
    }
  );

  // Upload a document (supports raw text or base64 PDF)
  app.post(
    "/api/documents/upload",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { title, category, fileType, rawText, base64Data } = req.body;

        if (!title) {
          return res.status(400).json({
            error: "Document title is required"
          });
        }

        let extractedText = rawText || "";
        let totalPages = 1;

        if (fileType === "pdf" && base64Data) {
          const cleanBase64 = base64Data.replace(
            /^data:[^;]+;base64,/,
            ""
          );

          let buffer: Buffer;
          try {
            buffer = Buffer.from(cleanBase64, "base64");
          } catch {
            return res.status(400).json({
              error: "Corrupted file payload. Please re-select the file."
            });
          }

          try {
            const parsed = await parsePdfBuffer(buffer);
            extractedText = parsed.text;
            totalPages = parsed.numPages;
          } catch (pdfErr: any) {
            console.error("PDF parsing error in upload route:", pdfErr);
            return res.status(400).json({
              error: `Could not parse PDF text (${pdfErr?.message || "unsupported PDF format"}). You can copy and paste the document text into the "Paste Contract Text" tab.`
            });
          }
        }

        if (!extractedText.trim()) {
          return res.status(400).json({
            error: "Document is empty or could not be parsed."
          });
        }

        const docId = `doc-${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 7)}`;

        // The chunker now receives the extracted document text
        // and document ID so page markers can be preserved.
        const chunks = chunkDocumentText(extractedText, docId);

        const docItem: DocumentItem = {
          id: docId,
          userId,
          title,
          category: category || "general",
          fileType: fileType || "text",
          createdAt: new Date().toISOString(),
          totalPages,
          rawText: extractedText,
          chunks
        };

        await docStore.addDocument(userId, docItem);

        res.json({
          success: true,
          document: docItem
        });
      } catch (err: any) {
        console.error("Upload error:", err);

        res.status(500).json({
          error: err.message || "Failed to process document"
        });
      }
    }
  );

  // Load sample document bundle into user's isolated Firestore collection
  app.post(
    "/api/documents/sample-bundle",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { bundleId } = req.body;

        const loaded = await docStore.loadSampleBundleForUser(
          userId,
          bundleId || "bundle-employment-equity"
        );

        res.json({
          success: true,
          documents: loaded
        });
      } catch (err: any) {
        console.error("Sample bundle error:", err);

        res.status(500).json({
          error: err.message || "Failed to load sample bundle"
        });
      }
    }
  );

  // Delete a document
  app.delete(
    "/api/documents/:id",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { id } = req.params;

        const success = await docStore.deleteDocument(userId, id);

        res.json({ success });
      } catch (err: any) {
        console.error("Delete document error:", err);

        res.status(500).json({
          error: err.message || "Failed to delete document"
        });
      }
    }
  );

  // Clear all documents for authenticated user
  app.post(
    "/api/documents/clear",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;

        await docStore.clearDocuments(userId);

        res.json({ success: true });
      } catch (err: any) {
        console.error("Clear documents error:", err);

        res.status(500).json({
          error: err.message || "Failed to clear documents"
        });
      }
    }
  );

  // 1. Analyze Document Understanding
  app.post(
    "/api/ai/analyze-document",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { documentId } = req.body;

        const doc = await docStore.getDocument(userId, documentId);

        if (!doc) {
          return res.status(404).json({
            error: "Document not found"
          });
        }

        if (doc.summary) {
          return res.json({
            success: true,
            summary: doc.summary
          });
        }

        const summary = await analyzeDocumentWithGemini(
          doc.title,
          doc.chunks
        );

        await docStore.updateDocumentSummary(
          userId,
          documentId,
          summary
        );

        res.json({
          success: true,
          summary
        });
      } catch (err: any) {
        console.error("Document analysis error:", err);

        res.status(500).json({
          error: err.message || "Failed to analyze document"
        });
      }
    }
  );

  // 2. Analyze Personalized Relevance ("What Matters To You")
  app.post(
    "/api/ai/personalized-relevance",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { concernPrompt, documentIds } = req.body;

        if (!concernPrompt || !concernPrompt.trim()) {
          return res.status(400).json({
            error: "Concern prompt is required"
          });
        }

        const allDocs = await docStore.getDocuments(userId);

        const targetDocs =
          documentIds && documentIds.length > 0
            ? allDocs.filter((d) => documentIds.includes(d.id))
            : allDocs;

        if (targetDocs.length === 0) {
          return res.status(400).json({
            error:
              "No documents available for analysis. Please upload or select a document first."
          });
        }

        const relevanceMap = await analyzePersonalizedRelevance(
          concernPrompt,
          targetDocs
        );

        await docStore.setRelevanceMap(userId, relevanceMap);

        res.json({
          success: true,
          relevanceMap
        });
      } catch (err: any) {
        console.error("Personalized relevance error:", err);

        res.status(500).json({
          error:
            err.message ||
            "Failed to analyze personalized relevance"
        });
      }
    }
  );

  // 3. Ask Evidence-Backed Question
  app.post(
    "/api/ai/ask",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const {
          question,
          userConcernContext,
          documentIds,
          allowSearchGrounding
        } = req.body;

        if (!question || !question.trim()) {
          return res.status(400).json({
            error: "Question is required"
          });
        }

        const allDocs = await docStore.getDocuments(userId);

        const targetDocs =
          documentIds && documentIds.length > 0
            ? allDocs.filter((d) => documentIds.includes(d.id))
            : allDocs;

        if (targetDocs.length === 0) {
          return res.status(400).json({
            error:
              "No documents available for question answering. Please upload a document first."
          });
        }

        const answer = await answerEvidenceBackedQuestion(
          question,
          userConcernContext || "",
          targetDocs,
          Boolean(allowSearchGrounding)
        );

        await docStore.addAnswer(userId, answer);

        res.json({
          success: true,
          answer
        });
      } catch (err: any) {
        console.error("Ask question error:", err);

        res.status(500).json({
          error: err.message || "Failed to answer question"
        });
      }
    }
  );

  // 4. Compare Two Documents
  app.post(
    "/api/ai/compare",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { doc1Id, doc2Id } = req.body;

        const doc1 = await docStore.getDocument(userId, doc1Id);
        const doc2 = await docStore.getDocument(userId, doc2Id);

        if (!doc1 || !doc2) {
          return res.status(400).json({
            error: "Both documents must exist for comparison."
          });
        }

        const comparison = await compareDocumentsWithGemini(
          doc1,
          doc2
        );

        await docStore.setComparison(userId, comparison);

        res.json({
          success: true,
          comparison
        });
      } catch (err: any) {
        console.error("Comparison error:", err);

        res.status(500).json({
          error: err.message || "Failed to compare documents"
        });
      }
    }
  );

  // 5. Generate Actionable Outputs
  // (Consultation Brief, Checklist, Targeted Questions)
  app.post(
    "/api/ai/actionable-outputs",
    requireAuth,
    async (req: AuthenticatedRequest, res: Response) => {
      try {
        const userId = req.user!.uid;
        const { userConcern, documentIds } = req.body;

        const allDocs = await docStore.getDocuments(userId);

        const targetDocs =
          documentIds && documentIds.length > 0
            ? allDocs.filter((d) => documentIds.includes(d.id))
            : allDocs;

        if (targetDocs.length === 0) {
          return res.status(400).json({
            error:
              "No documents found to generate actionable outputs."
          });
        }

        const outputs = await generateActionableOutputsWithGemini(
          userConcern || "",
          targetDocs
        );

        await docStore.setActionableOutputs(
          userId,
          outputs
        );

        res.json({
          success: true,
          outputs
        });
      } catch (err: any) {
        console.error("Actionable outputs error:", err);

        res.status(500).json({
          error:
            err.message ||
            "Failed to generate actionable outputs"
        });
      }
    }
  );

  // Guarantee that unhandled /api/* routes always return JSON 404, NEVER index.html
  app.all("/api/*", (req: Request, res: Response) => {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.path}`
    });
  });

  // Global error handler for uncaught server errors
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Unhandled server error:", err);
    if (res.headersSent) return;
    res.status(err.status || 500).json({
      error: err.message || "Internal server error"
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");

    app.use(express.static(distPath));

    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `LexiGuide server listening on http://0.0.0.0:${PORT}`
    );
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});