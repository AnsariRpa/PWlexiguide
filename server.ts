/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from "express";
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

dotenv.config();

const PORT = 3000;

function getUserId(req: Request): string {
  const headerUserId = req.headers["x-user-id"] as string;
  const queryUserId = req.query.userId as string;
  return headerUserId || queryUserId || "user_demo_1";
}

async function startServer() {
  const app = express();

  // Increase payload limit for PDF base64 uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // --- API Routes ---

  // Health check
  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({
      status: "ok",
      service: "LexiGuide API",
      geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
      timestamp: new Date().toISOString()
    });
  });

  // Get user documents
  app.get("/api/documents", (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const docs = docStore.getDocuments(userId);
      res.json({ success: true, documents: docs });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to fetch documents" });
    }
  });

  // Upload a document (supports raw text or base64 PDF)
  app.post("/api/documents/upload", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { title, category, fileType, rawText, base64Data } = req.body;

      if (!title) {
        return res.status(400).json({ error: "Document title is required" });
      }

      let extractedText = rawText || "";
      let totalPages = 1;

      if (fileType === "pdf" && base64Data) {
        const cleanBase64 = base64Data.replace(/^data:application\/pdf;base64,/, "");
        const buffer = Buffer.from(cleanBase64, "base64");
        const parsed = await parsePdfBuffer(buffer);
        extractedText = parsed.text;
        totalPages = parsed.numPages;
      }

      if (!extractedText.trim()) {
        return res.status(400).json({ error: "Document is empty or could not be parsed." });
      }

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const chunks = chunkDocumentText(docId, title, extractedText);

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

      docStore.addDocument(userId, docItem);

      res.json({ success: true, document: docItem });
    } catch (err: any) {
      console.error("Upload error:", err);
      res.status(500).json({ error: err.message || "Failed to process document" });
    }
  });

  // Load sample document bundle
  app.post("/api/documents/sample-bundle", (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { bundleId } = req.body;
      const loaded = docStore.loadSampleBundleForUser(userId, bundleId || "bundle-employment-equity");
      res.json({ success: true, documents: loaded });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to load sample bundle" });
    }
  });

  // Delete a document
  app.delete("/api/documents/:id", (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { id } = req.params;
      const success = docStore.deleteDocument(userId, id);
      res.json({ success });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to delete document" });
    }
  });

  // Clear all documents
  app.post("/api/documents/clear", (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      docStore.clearDocuments(userId);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Failed to clear documents" });
    }
  });

  // 1. Analyze Document Understanding
  app.post("/api/ai/analyze-document", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { documentId } = req.body;

      const doc = docStore.getDocument(userId, documentId);
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }

      if (doc.summary) {
        return res.json({ success: true, summary: doc.summary });
      }

      const summary = await analyzeDocumentWithGemini(doc.title, doc.chunks);
      docStore.updateDocumentSummary(userId, documentId, summary);

      res.json({ success: true, summary });
    } catch (err: any) {
      console.error("Document analysis error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze document" });
    }
  });

  // 2. Analyze Personalized Relevance ("What Matters To You")
  app.post("/api/ai/personalized-relevance", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { concernPrompt, documentIds } = req.body;

      if (!concernPrompt || !concernPrompt.trim()) {
        return res.status(400).json({ error: "Concern prompt is required" });
      }

      const allDocs = docStore.getDocuments(userId);
      const targetDocs = documentIds && documentIds.length > 0
        ? allDocs.filter(d => documentIds.includes(d.id))
        : allDocs;

      if (targetDocs.length === 0) {
        return res.status(400).json({ error: "No documents available for analysis. Please upload or select a document first." });
      }

      const relevanceMap = await analyzePersonalizedRelevance(concernPrompt, targetDocs);
      docStore.setRelevanceMap(userId, relevanceMap);

      res.json({ success: true, relevanceMap });
    } catch (err: any) {
      console.error("Personalized relevance error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze personalized relevance" });
    }
  });

  // 3. Ask Evidence-Backed Question
  app.post("/api/ai/ask", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { question, userConcernContext, documentIds, allowSearchGrounding } = req.body;

      if (!question || !question.trim()) {
        return res.status(400).json({ error: "Question is required" });
      }

      const allDocs = docStore.getDocuments(userId);
      const targetDocs = documentIds && documentIds.length > 0
        ? allDocs.filter(d => documentIds.includes(d.id))
        : allDocs;

      if (targetDocs.length === 0) {
        return res.status(400).json({ error: "No documents available for question answering. Please upload a document first." });
      }

      const answer = await answerEvidenceBackedQuestion(
        question,
        userConcernContext || "",
        targetDocs,
        Boolean(allowSearchGrounding)
      );

      docStore.addAnswer(userId, answer);

      res.json({ success: true, answer });
    } catch (err: any) {
      console.error("Ask question error:", err);
      res.status(500).json({ error: err.message || "Failed to answer question" });
    }
  });

  // 4. Compare Two Documents
  app.post("/api/ai/compare", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { doc1Id, doc2Id } = req.body;

      const doc1 = docStore.getDocument(userId, doc1Id);
      const doc2 = docStore.getDocument(userId, doc2Id);

      if (!doc1 || !doc2) {
        return res.status(400).json({ error: "Both documents must exist for comparison." });
      }

      const comparison = await compareDocumentsWithGemini(doc1, doc2);
      docStore.setComparison(userId, comparison);

      res.json({ success: true, comparison });
    } catch (err: any) {
      console.error("Comparison error:", err);
      res.status(500).json({ error: err.message || "Failed to compare documents" });
    }
  });

  // 5. Generate Actionable Outputs (Consultation Brief, Checklist, Targeted Questions)
  app.post("/api/ai/actionable-outputs", async (req: Request, res: Response) => {
    try {
      const userId = getUserId(req);
      const { userConcern, documentIds } = req.body;

      const allDocs = docStore.getDocuments(userId);
      const targetDocs = documentIds && documentIds.length > 0
        ? allDocs.filter(d => documentIds.includes(d.id))
        : allDocs;

      if (targetDocs.length === 0) {
        return res.status(400).json({ error: "No documents found to generate actionable outputs." });
      }

      const outputs = await generateActionableOutputsWithGemini(userConcern || "", targetDocs);
      docStore.setActionableOutputs(userId, outputs);

      res.json({ success: true, outputs });
    } catch (err: any) {
      console.error("Actionable outputs error:", err);
      res.status(500).json({ error: err.message || "Failed to generate actionable outputs" });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
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
    console.log(`LexiGuide server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});
