/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  DocumentItem,
  DocumentUnderstandingSummary,
  PersonalizedRelevanceMap,
  EvidenceBackedAnswer,
  DocumentComparisonResult,
  ActionableOutputs
} from '../types';

export class LexiGuideApi {
  private static tokenGetter: (() => Promise<string | null>) | null = null;

  public static setTokenGetter(getter: () => Promise<string | null>) {
    this.tokenGetter = getter;
  }

  private static async getHeaders(): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.tokenGetter) {
      const token = await this.tokenGetter();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  public static async fetchDocuments(): Promise<DocumentItem[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch documents');
    return data.documents || [];
  }

  public static async uploadDocument(payload: {
    title: string;
    category: string;
    fileType: 'text' | 'pdf';
    rawText?: string;
    base64Data?: string;
  }): Promise<DocumentItem> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/upload`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload document');
    return data.document;
  }

  public static async loadSampleBundle(bundleId: string): Promise<DocumentItem[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/sample-bundle`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bundleId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load sample bundle');
    return data.documents || [];
  }

  public static async deleteDocument(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete document');
  }

  public static async clearAllDocuments(): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/clear`, {
      method: 'POST',
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to clear documents');
  }

  public static async analyzeDocument(documentId: string): Promise<DocumentUnderstandingSummary> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/analyze-document`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ documentId })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze document');
    return data.summary;
  }

  public static async analyzePersonalizedRelevance(
    concernPrompt: string,
    documentIds?: string[]
  ): Promise<PersonalizedRelevanceMap> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/personalized-relevance`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ concernPrompt, documentIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to analyze personalized relevance');
    return data.relevanceMap;
  }

  public static async askEvidenceBackedQuestion(
    question: string,
    userConcernContext?: string,
    documentIds?: string[],
    allowSearchGrounding?: boolean
  ): Promise<EvidenceBackedAnswer> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/ask`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        question,
        userConcernContext,
        documentIds,
        allowSearchGrounding
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to answer question');
    return data.answer;
  }

  public static async compareDocuments(
    doc1Id: string,
    doc2Id: string
  ): Promise<DocumentComparisonResult> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/compare`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ doc1Id, doc2Id })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to compare documents');
    return data.comparison;
  }

  public static async generateActionableOutputs(
    userConcern?: string,
    documentIds?: string[]
  ): Promise<ActionableOutputs> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/actionable-outputs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ userConcern, documentIds })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate actionable outputs');
    return data.outputs;
  }
}
