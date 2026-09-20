/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentItem, UserConcernProfile, PersonalizedRelevanceMap, EvidenceBackedAnswer, DocumentComparisonResult, ActionableOutputs } from '../src/types';
import { SAMPLE_DOCUMENT_BUNDLES } from '../src/data/sampleLegalDocs';
import { chunkDocumentText } from '../src/utils/chunker';

interface UserData {
  documents: Map<string, DocumentItem>;
  concerns: UserConcernProfile[];
  relevanceMap?: PersonalizedRelevanceMap;
  answers: EvidenceBackedAnswer[];
  comparison?: DocumentComparisonResult;
  actionableOutputs?: ActionableOutputs;
}

class DocumentStore {
  private userStores: Map<string, UserData> = new Map();

  private getUserData(userId: string): UserData {
    if (!this.userStores.has(userId)) {
      const initialUserData: UserData = {
        documents: new Map(),
        concerns: [],
        answers: []
      };
      this.userStores.set(userId, initialUserData);
      // Auto-populate default sample documents for initial experience
      this.loadSampleBundleForUser(userId, 'bundle-employment-equity');
    }
    return this.userStores.get(userId)!;
  }

  public getDocuments(userId: string): DocumentItem[] {
    const data = this.getUserData(userId);
    return Array.from(data.documents.values());
  }

  public getDocument(userId: string, docId: string): DocumentItem | undefined {
    const data = this.getUserData(userId);
    return data.documents.get(docId);
  }

  public addDocument(userId: string, doc: DocumentItem): DocumentItem {
    const data = this.getUserData(userId);
    data.documents.set(doc.id, doc);
    return doc;
  }

  public updateDocumentSummary(userId: string, docId: string, summary: any): DocumentItem | undefined {
    const data = this.getUserData(userId);
    const doc = data.documents.get(docId);
    if (doc) {
      doc.summary = summary;
      data.documents.set(docId, doc);
    }
    return doc;
  }

  public deleteDocument(userId: string, docId: string): boolean {
    const data = this.getUserData(userId);
    return data.documents.delete(docId);
  }

  public clearDocuments(userId: string): void {
    const data = this.getUserData(userId);
    data.documents.clear();
    data.answers = [];
    data.relevanceMap = undefined;
    data.comparison = undefined;
    data.actionableOutputs = undefined;
  }

  public loadSampleBundleForUser(userId: string, bundleId: string): DocumentItem[] {
    const data = this.getUserData(userId);
    const bundle = SAMPLE_DOCUMENT_BUNDLES.find(b => b.id === bundleId);
    if (!bundle) return [];

    const loaded: DocumentItem[] = [];
    for (const sampleDoc of bundle.documents) {
      const docId = `sample-${sampleDoc.id}`;
      const chunks = chunkDocumentText(docId, sampleDoc.title, sampleDoc.text);
      const newDoc: DocumentItem = {
        id: docId,
        userId,
        title: sampleDoc.title,
        category: sampleDoc.category,
        fileType: 'text',
        createdAt: new Date().toISOString(),
        totalPages: sampleDoc.totalPages,
        rawText: sampleDoc.text,
        chunks
      };
      data.documents.set(docId, newDoc);
      loaded.push(newDoc);
    }
    return loaded;
  }

  public setRelevanceMap(userId: string, map: PersonalizedRelevanceMap): void {
    const data = this.getUserData(userId);
    data.relevanceMap = map;
  }

  public getRelevanceMap(userId: string): PersonalizedRelevanceMap | undefined {
    const data = this.getUserData(userId);
    return data.relevanceMap;
  }

  public addAnswer(userId: string, answer: EvidenceBackedAnswer): void {
    const data = this.getUserData(userId);
    data.answers.unshift(answer);
  }

  public getAnswers(userId: string): EvidenceBackedAnswer[] {
    const data = this.getUserData(userId);
    return data.answers;
  }

  public setComparison(userId: string, comp: DocumentComparisonResult): void {
    const data = this.getUserData(userId);
    data.comparison = comp;
  }

  public getComparison(userId: string): DocumentComparisonResult | undefined {
    const data = this.getUserData(userId);
    return data.comparison;
  }

  public setActionableOutputs(userId: string, outputs: ActionableOutputs): void {
    const data = this.getUserData(userId);
    data.actionableOutputs = outputs;
  }

  public getActionableOutputs(userId: string): ActionableOutputs | undefined {
    const data = this.getUserData(userId);
    return data.actionableOutputs;
  }
}

export const docStore = new DocumentStore();
