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

  /**
   * Robust response handler preventing "Unexpected token '<', <!doctype..." syntax errors
   * when Cloud Run or Express returns an HTML error page (413, 404, 502, etc.).
   */
  private static async handleResponse<T>(res: Response, fallbackError: string): Promise<T> {
    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        throw new Error('Invalid JSON received from server.');
      }

      if (!res.ok) {
        throw new Error(data?.error || `${fallbackError} (status ${res.status})`);
      }
      return data as T;
    }

    // Response is not JSON (HTML, plain text, or empty)
    const textBody = await res.text().catch(() => '');

    if (res.status === 413 || textBody.toLowerCase().includes('payload too large') || textBody.toLowerCase().includes('entity too large')) {
      throw new Error('The document is too large to process. Please upload a file under 15MB or paste text directly.');
    }
    if (res.status === 401) {
      throw new Error('Your session has expired. Please refresh the page or sign in again.');
    }
    if (res.status === 404) {
      throw new Error('API service endpoint not found. Please refresh the page.');
    }
    if (res.status >= 500) {
      throw new Error('Server encountered a temporary issue. Please try again in a few moments.');
    }

    throw new Error(`${fallbackError} (HTTP ${res.status}: ${res.statusText || 'Unexpected response'})`);
  }

  public static async fetchDocuments(): Promise<DocumentItem[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents`, { headers });
    const data = await this.handleResponse<{ documents: DocumentItem[] }>(res, 'Failed to fetch documents');
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
    const data = await this.handleResponse<{ document: DocumentItem }>(res, 'Failed to upload document');
    return data.document;
  }

  public static async loadSampleBundle(bundleId: string): Promise<DocumentItem[]> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/sample-bundle`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ bundleId })
    });
    const data = await this.handleResponse<{ documents: DocumentItem[] }>(res, 'Failed to load sample bundle');
    return data.documents || [];
  }

  public static async deleteDocument(id: string): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE',
      headers
    });
    await this.handleResponse<{ success: boolean }>(res, 'Failed to delete document');
  }

  public static async clearAllDocuments(): Promise<void> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/documents/clear`, {
      method: 'POST',
      headers
    });
    await this.handleResponse<{ success: boolean }>(res, 'Failed to clear documents');
  }

  public static async analyzeDocument(documentId: string): Promise<DocumentUnderstandingSummary> {
    const headers = await this.getHeaders();
    const res = await fetch(`/api/ai/analyze-document`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ documentId })
    });
    const data = await this.handleResponse<{ summary: DocumentUnderstandingSummary }>(res, 'Failed to analyze document');
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
    const data = await this.handleResponse<{ relevanceMap: PersonalizedRelevanceMap }>(res, 'Failed to analyze personalized relevance');
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
    const data = await this.handleResponse<{ answer: EvidenceBackedAnswer }>(res, 'Failed to answer question');
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
    const data = await this.handleResponse<{ comparison: DocumentComparisonResult }>(res, 'Failed to compare documents');
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
    const data = await this.handleResponse<{ outputs: ActionableOutputs }>(res, 'Failed to generate actionable outputs');
    return data.outputs;
  }
}
