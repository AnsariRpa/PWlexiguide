/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Globe,
  CheckCircle2,
  FileText,
  HelpCircle,
  Loader2,
  CornerDownRight,
  Search
} from 'lucide-react';
import { EvidenceBackedAnswer, DocumentItem, GapClassification } from '../types';

interface AskLexiGuideViewProps {
  documents: DocumentItem[];
  answers: EvidenceBackedAnswer[];
  onAskQuestion: (question: string, allowSearchGrounding: boolean) => Promise<void>;
  onOpenEvidence: (chunkId: string, citationText?: string) => void;
  isAsking: boolean;
  sampleQuestions?: string[];
}

export const AskLexiGuideView: React.FC<AskLexiGuideViewProps> = ({
  documents,
  answers,
  onAskQuestion,
  onOpenEvidence,
  isAsking,
  sampleQuestions = []
}) => {
  const [questionInput, setQuestionInput] = useState('');
  const [allowSearchGrounding, setAllowSearchGrounding] = useState(false);

  const defaultSampleQuestions = sampleQuestions.length > 0 ? sampleQuestions : [
    'What happens to my compensation and stock options if I leave the company or get terminated?',
    'What are the exact conditions and notice deadlines to receive my full security deposit back?',
    'Can I work on personal open-source software on weekends without the company owning it?',
    'Does this agreement have a mandatory arbitration clause or class action waiver?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || isAsking) return;
    onAskQuestion(questionInput.trim(), allowSearchGrounding);
    setQuestionInput('');
  };

  const handleSelectSample = (q: string) => {
    setQuestionInput(q);
    onAskQuestion(q, allowSearchGrounding);
  };

  const getGapBadge = (gap: GapClassification) => {
    switch (gap) {
      case 'explicitly_stated':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            <span>Explicitly Stated</span>
          </span>
        );
      case 'indirectly_relevant':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
            <HelpCircle className="w-3 h-3" />
            <span>Indirectly Relevant</span>
          </span>
        );
      case 'not_established':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-3 h-3" />
            <span>Not Established in Text</span>
          </span>
        );
      case 'requires_external_info':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <Globe className="w-3 h-3" />
            <span>Requires External Statutory Context</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Question Input Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-inner">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Ask LexiGuide: Evidence-First Inquiries
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ask any natural language question. Every substantive answer is strictly grounded in verifiable document citations with plain-language interpretations.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <input
              id="input-legal-question"
              type="text"
              value={questionInput}
              onChange={(e) => setQuestionInput(e.target.value)}
              placeholder="Ask a question about your documents (e.g., 'What happens to my unvested equity upon departure?')"
              disabled={isAsking || documents.length === 0}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-28 shadow-inner"
            />
            <button
              id="btn-submit-legal-question"
              type="submit"
              disabled={isAsking || !questionInput.trim() || documents.length === 0}
              className="absolute right-2 top-2 bottom-2 inline-flex items-center space-x-1.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {isAsking ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Researching...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask</span>
                </>
              )}
            </button>
          </div>

          {/* Options: Google Search Grounding toggle & Sample pills */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <label className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allowSearchGrounding}
                onChange={(e) => setAllowSearchGrounding(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="flex items-center space-x-1 font-medium">
                <Globe className="w-3.5 h-3.5 text-teal-500" />
                <span>Include Google Search Grounding for statutory/jurisdiction context</span>
              </span>
            </label>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 text-[11px]">Suggestions:</span>
              {defaultSampleQuestions.slice(0, 2).map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(q)}
                  className="text-left text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 truncate max-w-xs"
                  title={q}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Answers Stream */}
      <div className="space-y-6">
        {answers.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            <MessageSquareText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">No questions asked yet.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Type your legal inquiry above to receive an evidence-backed answer that highlights exact clauses, interpretations, and actionable follow-ups.
            </p>
          </div>
        ) : (
          answers.map((ans) => (
            <div
              key={ans.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-5 sm:p-6"
            >
              {/* Question Header */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-0.5">
                    <MessageSquareText className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      User Question
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      "{ans.question}"
                    </h3>
                  </div>
                </div>

                <div className="flex-shrink-0">
                  {getGapBadge(ans.gapClassification)}
                </div>
              </div>

              {/* 1. Answer (Plain language synthesis) */}
              <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plain-Language Synthesis</span>
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {ans.answer}
                </p>
              </div>

              {/* 2. What the document says & Exact Citations */}
              <div className="p-4 rounded-xl bg-slate-100/60 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>What the Document Says (Direct Textual Evidence)</span>
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {ans.citations?.length || 0} Verifiable {ans.citations?.length === 1 ? 'Citation' : 'Citations'}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {ans.whatDocumentSays}
                </p>

                {/* Citations List */}
                {ans.citations && ans.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                    {ans.citations.map((cite, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center space-x-2 text-slate-900 dark:text-slate-100 font-semibold text-xs">
                            <span>{cite.documentName}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-indigo-600 dark:text-indigo-400">Page {cite.pageNumber}</span>
                            <span className="text-slate-400">•</span>
                            <span>{cite.section}</span>
                          </div>
                          {cite.textSnippet && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-0.5 line-clamp-1">
                              "{cite.textSnippet}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => onOpenEvidence(cite.chunkId, `${cite.documentName} — Page ${cite.pageNumber}`)}
                          className="self-start sm:self-center inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          <span>Inspect Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. What This Means For You */}
              <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                  What This Means For You (Personalized Interpretation)
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {ans.whatThisMeansForYou}
                </p>
              </div>

              {/* 4. What Is Unclear / Information Gaps */}
              {ans.whatIsUnclear && (
                <div className="p-3.5 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-xs">
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>What Remains Uncertain / Missing From Documents</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {ans.whatIsUnclear}
                  </p>
                </div>
              )}

              {/* 5. External Google Search Grounding Context (if applied) */}
              {ans.externalContext && ans.externalContext.used && (
                <div className="p-3.5 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs">
                  <div className="flex items-center space-x-1.5 text-teal-700 dark:text-teal-400 font-bold mb-1">
                    <Globe className="w-4 h-4" />
                    <span>Grounded External Statutory Information (Google Search)</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {ans.externalContext.explanation}
                  </p>
                  {ans.externalContext.sources && ans.externalContext.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-2 pt-2 border-t border-teal-200/40 dark:border-teal-900/40">
                      <span className="text-[10px] text-slate-500 font-medium">Grounded Sources:</span>
                      {ans.externalContext.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 text-[11px] text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          <span>{src.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 6. Claim Verification Matrix (Section 28) */}
              {ans.claimVerification && ans.claimVerification.length > 0 && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Claim Verification Breakdown
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ans.claimVerification.map((cv, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-md bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-start space-x-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-slate-800 dark:text-slate-200 font-medium text-[11px]">
                            {cv.claim}
                          </p>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {cv.evidenceNote}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. What You May Want To Ask */}
              {ans.whatYouMayWantToAsk && ans.whatYouMayWantToAsk.length > 0 && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1.5">
                    What You May Want to Ask (Employer, Landlord, or Counsel)
                  </span>
                  <ul className="space-y-1 text-slate-700 dark:text-slate-300">
                    {ans.whatYouMayWantToAsk.map((q, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CornerDownRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
