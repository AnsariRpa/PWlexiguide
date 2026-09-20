/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { SafetyDisclaimerBanner } from './components/SafetyDisclaimerBanner';
import { DocumentSelector } from './components/DocumentSelector';
import { DocumentWorkspace } from './components/DocumentWorkspace';
import { PersonalizedRelevanceView } from './components/PersonalizedRelevanceView';
import { AskLexiGuideView } from './components/AskLexiGuideView';
import { DocumentComparisonView } from './components/DocumentComparisonView';
import { PrepareAndExportView } from './components/PrepareAndExportView';
import { EvidenceInspectorModal } from './components/EvidenceInspectorModal';
import { UploadModal } from './components/UploadModal';
import { WhyLexiGuideCard } from './components/WhyLexiGuideCard';
import { LexiGuideApi } from './services/api';
import {
  DocumentItem,
  PersonalizedRelevanceMap,
  EvidenceBackedAnswer,
  DocumentComparisonResult,
  ActionableOutputs,
  UserSession,
  DocumentCategory
} from './types';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('workspace');
  const [currentUser, setCurrentUser] = useState<UserSession>({
    uid: 'user_alex_morgan',
    displayName: 'Alex Morgan',
    email: 'ansariprototype@gmail.com'
  });

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // States for features
  const [relevanceMap, setRelevanceMap] = useState<PersonalizedRelevanceMap | null>(null);
  const [answers, setAnswers] = useState<EvidenceBackedAnswer[]>([]);
  const [comparison, setComparison] = useState<DocumentComparisonResult | null>(null);
  const [actionableOutputs, setActionableOutputs] = useState<ActionableOutputs | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [evidenceInspector, setEvidenceInspector] = useState<{
    isOpen: boolean;
    chunkId: string | null;
    citationLabel?: string;
  }>({
    isOpen: false,
    chunkId: null
  });

  // Loading states
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isAnalyzingDoc, setIsAnalyzingDoc] = useState(false);
  const [isAnalyzingRelevance, setIsAnalyzingRelevance] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [isGeneratingOutputs, setIsGeneratingOutputs] = useState(false);

  // Global notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Initial load
  useEffect(() => {
    LexiGuideApi.setUserId(currentUser.uid);
    loadDocuments(true);
  }, [currentUser.uid]);

  const loadDocuments = async (loadSampleIfEmpty = false) => {
    setIsLoadingDocs(true);
    try {
      let docs = await LexiGuideApi.fetchDocuments();
      if (docs.length === 0 && loadSampleIfEmpty) {
        // Automatically bootstrap sample bundle for instant rich exploration
        docs = await LexiGuideApi.loadSampleBundle('bundle-employment-equity');
      }
      setDocuments(docs);
      if (docs.length > 0 && !activeDocumentId) {
        setActiveDocumentId(docs[0].id);
      }
    } catch (err: any) {
      console.error("Error loading documents:", err);
      showToast(err.message || "Failed to load documents", 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleSwitchUser = () => {
    const nextUser: UserSession = currentUser.uid === 'user_alex_morgan'
      ? { uid: 'user_jordan_lee', displayName: 'Jordan Lee (Counsel)', email: 'jordan.legal@enterprise.com' }
      : { uid: 'user_alex_morgan', displayName: 'Alex Morgan', email: 'ansariprototype@gmail.com' };

    setCurrentUser(nextUser);
    LexiGuideApi.setUserId(nextUser.uid);
    setActiveDocumentId(null);
    setRelevanceMap(null);
    setAnswers([]);
    setComparison(null);
    setActionableOutputs(null);
    showToast(`Switched workspace to ${nextUser.displayName}`);
  };

  const handleLoadSampleBundle = async (bundleId: string) => {
    setIsLoadingDocs(true);
    try {
      const docs = await LexiGuideApi.loadSampleBundle(bundleId);
      setDocuments(docs);
      if (docs.length > 0) {
        setActiveDocumentId(docs[0].id);
      }
      // Reset view-specific results to match new documents
      setRelevanceMap(null);
      setAnswers([]);
      setComparison(null);
      setActionableOutputs(null);
      showToast("Loaded sample legal document bundle");
    } catch (err: any) {
      showToast(err.message || "Failed to load bundle", 'error');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const handleUploadDocument = async (payload: {
    title: string;
    category: DocumentCategory;
    fileType: 'text' | 'pdf';
    rawText?: string;
    base64Data?: string;
  }) => {
    try {
      const doc = await LexiGuideApi.uploadDocument(payload);
      setDocuments(prev => [doc, ...prev]);
      setActiveDocumentId(doc.id);
      showToast(`Added document: ${doc.title}`);
    } catch (err: any) {
      showToast(err.message || "Failed to upload document", 'error');
      throw err;
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await LexiGuideApi.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (activeDocumentId === id) {
        const remaining = documents.filter(d => d.id !== id);
        setActiveDocumentId(remaining.length > 0 ? remaining[0].id : null);
      }
      showToast("Document removed from workspace");
    } catch (err: any) {
      showToast(err.message || "Failed to delete document", 'error');
    }
  };

  const handleAnalyzeDocument = async (docId: string) => {
    setIsAnalyzingDoc(true);
    try {
      const summary = await LexiGuideApi.analyzeDocument(docId);
      setDocuments(prev => prev.map(d => d.id === docId ? { ...d, summary } : d));
      showToast("Document understanding generated with verified citations");
    } catch (err: any) {
      showToast(err.message || "Failed to analyze document", 'error');
    } finally {
      setIsAnalyzingDoc(false);
    }
  };

  const handleAnalyzeRelevance = async (concernPrompt: string) => {
    setIsAnalyzingRelevance(true);
    try {
      const result = await LexiGuideApi.analyzePersonalizedRelevance(concernPrompt);
      setRelevanceMap(result);
      showToast("Generated personalized legal relevance map");
    } catch (err: any) {
      showToast(err.message || "Failed to map relevance", 'error');
    } finally {
      setIsAnalyzingRelevance(false);
    }
  };

  const handleAskQuestion = async (question: string, allowSearchGrounding: boolean) => {
    setIsAsking(true);
    try {
      const answer = await LexiGuideApi.askEvidenceBackedQuestion(
        question,
        relevanceMap?.concernSummary,
        undefined,
        allowSearchGrounding
      );
      setAnswers(prev => [answer, ...prev]);
      showToast("Answer synthesized with document citations");
    } catch (err: any) {
      showToast(err.message || "Failed to answer question", 'error');
    } finally {
      setIsAsking(false);
    }
  };

  const handleCompare = async (doc1Id: string, doc2Id: string) => {
    setIsComparing(true);
    try {
      const result = await LexiGuideApi.compareDocuments(doc1Id, doc2Id);
      setComparison(result);
      showToast("Document comparison completed");
    } catch (err: any) {
      showToast(err.message || "Failed to compare documents", 'error');
    } finally {
      setIsComparing(false);
    }
  };

  const handleGenerateOutputs = async (userConcern?: string) => {
    setIsGeneratingOutputs(true);
    try {
      const result = await LexiGuideApi.generateActionableOutputs(
        userConcern || relevanceMap?.concernSummary
      );
      setActionableOutputs(result);
      showToast("Legal Consultation Brief & Checklist ready");
    } catch (err: any) {
      showToast(err.message || "Failed to generate actionable pack", 'error');
    } finally {
      setIsGeneratingOutputs(false);
    }
  };

  const handleOpenEvidence = (chunkId: string, citationText?: string) => {
    if (!chunkId && documents.length > 0) {
      chunkId = documents[0].chunks[0]?.id || '';
    }
    setEvidenceInspector({
      isOpen: true,
      chunkId,
      citationLabel: citationText
    });
  };

  const activeDoc = documents.find(d => d.id === activeDocumentId) || (documents.length > 0 ? documents[0] : null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        documentCount={documents.length}
      />

      {/* Safety & Legal Advice Disclaimer Banner */}
      <SafetyDisclaimerBanner />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Document Selector & Quick Sample Switcher */}
        <DocumentSelector
          documents={documents}
          activeDocumentId={activeDoc?.id || null}
          onSelectDocument={(id) => setActiveDocumentId(id)}
          onDeleteDocument={handleDeleteDocument}
          onOpenUpload={() => setIsUploadOpen(true)}
          onLoadSampleBundle={handleLoadSampleBundle}
          isLoading={isLoadingDocs}
        />

        {/* Dynamic View based on Active Tab */}
        {activeTab === 'workspace' && (
          <DocumentWorkspace
            document={activeDoc}
            onAnalyzeDocument={handleAnalyzeDocument}
            onOpenEvidence={handleOpenEvidence}
            isAnalyzing={isAnalyzingDoc}
          />
        )}

        {activeTab === 'relevance' && (
          <PersonalizedRelevanceView
            documents={documents}
            relevanceMap={relevanceMap}
            onAnalyzeRelevance={handleAnalyzeRelevance}
            onOpenEvidence={handleOpenEvidence}
            isAnalyzing={isAnalyzingRelevance}
          />
        )}

        {activeTab === 'ask' && (
          <AskLexiGuideView
            documents={documents}
            answers={answers}
            onAskQuestion={handleAskQuestion}
            onOpenEvidence={handleOpenEvidence}
            isAsking={isAsking}
          />
        )}

        {activeTab === 'compare' && (
          <DocumentComparisonView
            documents={documents}
            comparison={comparison}
            onCompare={handleCompare}
            onOpenEvidence={handleOpenEvidence}
            isComparing={isComparing}
          />
        )}

        {activeTab === 'prepare' && (
          <PrepareAndExportView
            documents={documents}
            outputs={actionableOutputs}
            onGenerateOutputs={handleGenerateOutputs}
            isGenerating={isGeneratingOutputs}
            onOpenEvidence={handleOpenEvidence}
          />
        )}

        {/* Differentiator Explainer Card */}
        <div className="pt-4">
          <WhyLexiGuideCard />
        </div>
      </main>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={handleUploadDocument}
      />

      <EvidenceInspectorModal
        isOpen={evidenceInspector.isOpen}
        onClose={() => setEvidenceInspector({ isOpen: false, chunkId: null })}
        chunkId={evidenceInspector.chunkId}
        documents={documents}
        citationLabel={evidenceInspector.citationLabel}
      />

      {/* Global Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold text-white ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900 border border-slate-700'
          }`}>
            {toast.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-200" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
