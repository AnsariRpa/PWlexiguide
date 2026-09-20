/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DocumentCategory = 
  | 'employment' 
  | 'lease' 
  | 'nda' 
  | 'service' 
  | 'policy' 
  | 'general';

export interface DocumentChunk {
  id: string;
  documentId: string;
  documentName: string;
  pageNumber: number;
  section: string;
  paragraph: number;
  lineRange: string;
  text: string;
}

export interface DocumentUnderstandingSummary {
  overview: string;
  parties: { name: string; role: string }[];
  corePurpose: string;
  majorSections: {
    title: string;
    summary: string;
    citation: string;
    chunkId?: string;
  }[];
  majorObligations: {
    obligation: string;
    party: string;
    urgency: 'high' | 'medium' | 'low';
    citation: string;
    chunkId?: string;
  }[];
  majorRights: {
    right: string;
    party: string;
    citation: string;
    chunkId?: string;
  }[];
  importantDates: {
    dateOrPeriod: string;
    description: string;
    type: 'deadline' | 'effective' | 'termination' | 'renewal';
    citation: string;
    chunkId?: string;
  }[];
  financialTerms: {
    term: string;
    details: string;
    citation: string;
    chunkId?: string;
  }[];
  terminationProvisions: {
    description: string;
    conditions: string;
    noticePeriod: string;
    citation: string;
    chunkId?: string;
  }[];
  unusualClauses: {
    title: string;
    whySignificant: string;
    citation: string;
    chunkId?: string;
  }[];
}

export interface DocumentItem {
  id: string;
  userId: string;
  title: string;
  category: DocumentCategory;
  fileType: 'pdf' | 'text' | 'markdown';
  createdAt: string;
  totalPages: number;
  rawText: string;
  chunks: DocumentChunk[];
  summary?: DocumentUnderstandingSummary;
}

export interface UserConcernProfile {
  id: string;
  userId: string;
  rawPrompt: string;
  extractedIntent: string;
  primaryConcerns: string[];
  riskPriorities: string[];
  createdAt: string;
}

export type GapClassification = 
  | 'explicitly_stated' 
  | 'indirectly_relevant' 
  | 'not_established' 
  | 'requires_external_info';

export interface PersonalizedRelevanceItem {
  id: string;
  topic: string;
  relevanceLevel: 'critical' | 'high' | 'moderate';
  whatDocumentSays: string;
  whatItMeansForUser: string;
  gapClassification: GapClassification;
  gapNotes: string;
  citation: string;
  chunkId?: string;
  recommendedQuestion: string;
}

export interface InformationGap {
  missingTopic: string;
  whyItMatters: string;
  gapClassification: 'not_established' | 'requires_external_info';
  recommendedNextStep: string;
}

export interface PersonalizedRelevanceMap {
  concernSummary: string;
  relevantItems: PersonalizedRelevanceItem[];
  informationGaps: InformationGap[];
}

export interface EvidenceReference {
  documentId: string;
  documentName: string;
  pageNumber: number;
  section: string;
  paragraph: number;
  lineRange: string;
  textSnippet: string;
  chunkId: string;
}

export interface ClaimVerification {
  claim: string;
  supported: boolean;
  sourceType: 'document' | 'external' | 'uncertain';
  evidenceNote: string;
}

export interface EvidenceBackedAnswer {
  id: string;
  question: string;
  answer: string;
  whatDocumentSays: string;
  citations: EvidenceReference[];
  whatThisMeansForYou: string;
  whatIsUnclear: string;
  gapClassification: GapClassification;
  whatYouMayWantToAsk: string[];
  externalContext?: {
    used: boolean;
    jurisdiction?: string;
    explanation: string;
    sources?: { title: string; uri: string }[];
  };
  claimVerification: ClaimVerification[];
  createdAt: string;
}

export interface MeaningfulChange {
  topic: string;
  doc1Wording: string;
  doc2Wording: string;
  whatChanged: string;
  whyItMatters: string;
  impactLevel: 'high' | 'moderate' | 'minor';
  doc1Citation: string;
  doc1ChunkId?: string;
  doc2Citation: string;
  doc2ChunkId?: string;
}

export interface DocumentComparisonResult {
  doc1Id: string;
  doc1Name: string;
  doc2Id: string;
  doc2Name: string;
  summaryOfDifferences: string;
  changes: MeaningfulChange[];
}

export interface ActionChecklistItem {
  id: string;
  task: string;
  category: 'immediate' | 'before_signing' | 'records_to_keep' | 'future_milestone';
  dueOrTiming: string;
  details: string;
  completed: boolean;
}

export interface TargetedQuestion {
  recipient: 'HR / Employer' | 'Landlord' | 'Legal Counsel' | 'Counterparty' | 'Insurance Broker';
  question: string;
  context: string;
  targetClauseCitation: string;
}

export interface ConsultationBrief {
  title: string;
  clientContext: string;
  keyFacts: string[];
  coreIssues: string[];
  relevantClausesWithCitations: { clause: string; citation: string }[];
  questionsForCounsel: string[];
  actionItems: string[];
}

export interface ActionableOutputs {
  consultationBrief: ConsultationBrief;
  actionChecklist: ActionChecklistItem[];
  questionsToAsk: TargetedQuestion[];
}

export interface UserSession {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
}
