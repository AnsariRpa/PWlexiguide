/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DocumentItem,
  PersonalizedRelevanceMap,
  EvidenceBackedAnswer,
  DocumentComparisonResult,
  ActionableOutputs
} from "../src/types";
import { SAMPLE_DOCUMENT_BUNDLES } from "../src/data/sampleLegalDocs";
import { chunkDocumentText } from "../src/utils/chunker";
import { getFirebaseAdmin } from "./firebaseAdmin";
import type { QueryDocumentSnapshot } from "firebase-admin/firestore";

interface MemoryUserData {
  documents: Map<string, DocumentItem>;
  answers: EvidenceBackedAnswer[];
  relevanceMap?: PersonalizedRelevanceMap;
  comparison?: DocumentComparisonResult;
  actionableOutputs?: ActionableOutputs;
}

/**
 * Resilient DocumentStore providing Firestore cloud persistence with automatic
 * in-memory fallback cache if Cloud Firestore permissions or network are pending.
 * All operations are strictly partitioned by the verified Firebase UID:
 * users/{uid}/documents/{documentId}
 * users/{uid}/relevanceMap/current
 * users/{uid}/answers/{answerId}
 * users/{uid}/comparison/current
 * users/{uid}/actionableOutputs/current
 */
class FirestoreDocumentStore {
  private fallbackMemoryStores: Map<string, MemoryUserData> = new Map();

  private getDb() {
    try {
      const { db } = getFirebaseAdmin();
      return db;
    } catch (e) {
      return null;
    }
  }

  private getMemoryStore(userId: string): MemoryUserData {
    if (!this.fallbackMemoryStores.has(userId)) {
      this.fallbackMemoryStores.set(userId, {
        documents: new Map(),
        answers: []
      });
    }
    return this.fallbackMemoryStores.get(userId)!;
  }

  // --- Document Operations ---

  public async getDocuments(userId: string): Promise<DocumentItem[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db
          .collection("users")
          .doc(userId)
          .collection("documents")
          .orderBy("createdAt", "desc")
          .get();

        if (!snapshot.empty) {
          return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as DocumentItem);
        }
      } catch (err: any) {
        console.warn(`Firestore getDocuments fallback to cache for user ${userId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return Array.from(mem.documents.values());
  }

  public async getDocument(userId: string, docId: string): Promise<DocumentItem | undefined> {
    const db = this.getDb();
    if (db) {
      try {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("documents")
          .doc(docId);

        const snapshot = await docRef.get();
        if (snapshot.exists) {
          return snapshot.data() as DocumentItem;
        }
      } catch (err: any) {
        console.warn(`Firestore getDocument fallback for ${docId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return mem.documents.get(docId);
  }

  public async addDocument(userId: string, doc: DocumentItem): Promise<DocumentItem> {
    const docToSave = { ...doc, userId };

    // Update memory cache
    const mem = this.getMemoryStore(userId);
    mem.documents.set(doc.id, docToSave);

    const db = this.getDb();
    if (db) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("documents")
          .doc(doc.id)
          .set(docToSave);
      } catch (err: any) {
        console.warn(`Firestore addDocument fallback to memory for ${doc.id}:`, err?.message || err);
      }
    }

    return docToSave;
  }

  public async updateDocumentSummary(userId: string, docId: string, summary: any): Promise<DocumentItem | undefined> {
    const mem = this.getMemoryStore(userId);
    const existing = mem.documents.get(docId);
    if (existing) {
      existing.summary = summary;
      mem.documents.set(docId, existing);
    }

    const db = this.getDb();
    if (db) {
      try {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("documents")
          .doc(docId);

        const snapshot = await docRef.get();
        if (snapshot.exists) {
          await docRef.update({ summary });
          const updated = await docRef.get();
          return updated.data() as DocumentItem;
        }
      } catch (err: any) {
        console.warn(`Firestore updateSummary fallback for ${docId}:`, err?.message || err);
      }
    }

    return existing;
  }

  public async deleteDocument(userId: string, docId: string): Promise<boolean> {
    const mem = this.getMemoryStore(userId);
    const removedFromMem = mem.documents.delete(docId);

    const db = this.getDb();
    if (db) {
      try {
        const docRef = db
          .collection("users")
          .doc(userId)
          .collection("documents")
          .doc(docId);

        await docRef.delete();
        return true;
      } catch (err: any) {
        console.warn(`Firestore deleteDocument fallback for ${docId}:`, err?.message || err);
      }
    }

    return removedFromMem;
  }

  public async clearDocuments(userId: string): Promise<void> {
    const mem = this.getMemoryStore(userId);
    mem.documents.clear();
    mem.answers = [];
    mem.relevanceMap = undefined;
    mem.comparison = undefined;
    mem.actionableOutputs = undefined;

    const db = this.getDb();
    if (db) {
      try {
        const userRef = db.collection("users").doc(userId);
        const docsSnapshot = await userRef.collection("documents").get();
        const batch = db.batch();
        docsSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
          batch.delete(doc.ref);
        });
        batch.delete(userRef.collection("relevanceMap").doc("current"));
        batch.delete(userRef.collection("comparison").doc("current"));
        batch.delete(userRef.collection("actionableOutputs").doc("current"));

        const answersSnapshot = await userRef.collection("answers").get();
        answersSnapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
          batch.delete(doc.ref);
        });

        await batch.commit();
      } catch (err: any) {
        console.warn(`Firestore clearDocuments fallback for ${userId}:`, err?.message || err);
      }
    }
  }

  public async loadSampleBundleForUser(userId: string, bundleId: string): Promise<DocumentItem[]> {
    const bundle = SAMPLE_DOCUMENT_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return [];

    const loaded: DocumentItem[] = [];
    const mem = this.getMemoryStore(userId);

    for (const sampleDoc of bundle.documents) {
      const docId = `sample-${sampleDoc.id}`;
      const chunks = chunkDocumentText(docId, sampleDoc.title, sampleDoc.text);
      const newDoc: DocumentItem = {
        id: docId,
        userId,
        title: sampleDoc.title,
        category: sampleDoc.category,
        fileType: "text",
        createdAt: new Date().toISOString(),
        totalPages: sampleDoc.totalPages,
        rawText: sampleDoc.text,
        chunks
      };
      mem.documents.set(docId, newDoc);
      loaded.push(newDoc);
    }

    const db = this.getDb();
    if (db) {
      try {
        const batch = db.batch();
        for (const newDoc of loaded) {
          const docRef = db
            .collection("users")
            .doc(userId)
            .collection("documents")
            .doc(newDoc.id);
          batch.set(docRef, newDoc);
        }
        await batch.commit();
      } catch (err: any) {
        console.warn(`Firestore loadSampleBundle fallback for ${bundleId}:`, err?.message || err);
      }
    }

    return loaded;
  }

  // --- Relevance Map Operations ---

  public async setRelevanceMap(userId: string, map: PersonalizedRelevanceMap): Promise<void> {
    const mem = this.getMemoryStore(userId);
    mem.relevanceMap = map;

    const db = this.getDb();
    if (db) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("relevanceMap")
          .doc("current")
          .set({ ...map, userId, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn(`Firestore setRelevanceMap fallback for ${userId}:`, err?.message || err);
      }
    }
  }

  public async getRelevanceMap(userId: string): Promise<PersonalizedRelevanceMap | undefined> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db
          .collection("users")
          .doc(userId)
          .collection("relevanceMap")
          .doc("current")
          .get();

        if (doc.exists) {
          return doc.data() as PersonalizedRelevanceMap;
        }
      } catch (err: any) {
        console.warn(`Firestore getRelevanceMap fallback for ${userId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return mem.relevanceMap;
  }

  // --- Answers Operations ---

  public async addAnswer(userId: string, answer: EvidenceBackedAnswer): Promise<void> {
    const mem = this.getMemoryStore(userId);
    mem.answers.unshift(answer);

    const db = this.getDb();
    if (db) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("answers")
          .doc(answer.id)
          .set({ ...answer, userId });
      } catch (err: any) {
        console.warn(`Firestore addAnswer fallback for ${userId}:`, err?.message || err);
      }
    }
  }

  public async getAnswers(userId: string): Promise<EvidenceBackedAnswer[]> {
    const db = this.getDb();
    if (db) {
      try {
        const snapshot = await db
          .collection("users")
          .doc(userId)
          .collection("answers")
          .orderBy("createdAt", "desc")
          .get();

        if (!snapshot.empty) {
          return snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data() as EvidenceBackedAnswer);
        }
      } catch (err: any) {
        console.warn(`Firestore getAnswers fallback for ${userId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return mem.answers;
  }

  // --- Comparison Operations ---

  public async setComparison(userId: string, comp: DocumentComparisonResult): Promise<void> {
    const mem = this.getMemoryStore(userId);
    mem.comparison = comp;

    const db = this.getDb();
    if (db) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("comparison")
          .doc("current")
          .set({ ...comp, userId, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn(`Firestore setComparison fallback for ${userId}:`, err?.message || err);
      }
    }
  }

  public async getComparison(userId: string): Promise<DocumentComparisonResult | undefined> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db
          .collection("users")
          .doc(userId)
          .collection("comparison")
          .doc("current")
          .get();

        if (doc.exists) {
          return doc.data() as DocumentComparisonResult;
        }
      } catch (err: any) {
        console.warn(`Firestore getComparison fallback for ${userId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return mem.comparison;
  }

  // --- Actionable Outputs Operations ---

  public async setActionableOutputs(userId: string, outputs: ActionableOutputs): Promise<void> {
    const mem = this.getMemoryStore(userId);
    mem.actionableOutputs = outputs;

    const db = this.getDb();
    if (db) {
      try {
        await db
          .collection("users")
          .doc(userId)
          .collection("actionableOutputs")
          .doc("current")
          .set({ ...outputs, userId, updatedAt: new Date().toISOString() });
      } catch (err: any) {
        console.warn(`Firestore setActionableOutputs fallback for ${userId}:`, err?.message || err);
      }
    }
  }

  public async getActionableOutputs(userId: string): Promise<ActionableOutputs | undefined> {
    const db = this.getDb();
    if (db) {
      try {
        const doc = await db
          .collection("users")
          .doc(userId)
          .collection("actionableOutputs")
          .doc("current")
          .get();

        if (doc.exists) {
          return doc.data() as ActionableOutputs;
        }
      } catch (err: any) {
        console.warn(`Firestore getActionableOutputs fallback for ${userId}:`, err?.message || err);
      }
    }

    const mem = this.getMemoryStore(userId);
    return mem.actionableOutputs;
  }
}

export const docStore = new FirestoreDocumentStore();
