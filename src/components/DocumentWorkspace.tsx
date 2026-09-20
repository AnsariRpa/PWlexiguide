/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Users,
  ShieldCheck,
  AlertCircle,
  Calendar,
  DollarSign,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Clock,
  Loader2,
  FileSearch,
  BookOpen
} from 'lucide-react';
import { DocumentItem, DocumentUnderstandingSummary } from '../types';

interface DocumentWorkspaceProps {
  document: DocumentItem | null;
  onAnalyzeDocument: (docId: string) => Promise<void>;
  onOpenEvidence: (chunkId: string, citationText?: string) => void;
  isAnalyzing: boolean;
}

export const DocumentWorkspace: React.FC<DocumentWorkspaceProps> = ({
  document,
  onAnalyzeDocument,
  onOpenEvidence,
  isAnalyzing
}) => {
  const [activeSectionTab, setActiveSectionTab] = useState<'overview' | 'obligations' | 'rights' | 'dates' | 'financial' | 'termination' | 'unusual'>('overview');

  if (!document) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
        <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-400" />
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Select or upload a document to view its understanding workspace.</p>
      </div>
    );
  }

  const summary = document.summary;

  return (
    <div className="space-y-6">
      {/* Top Banner: Document Title & AI Status */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase font-semibold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                {document.category}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-500">{document.totalPages} {document.totalPages === 1 ? 'Page' : 'Pages'}</span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-500">{document.chunks.length} Evidentiary Chunks</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {document.title}
            </h1>
          </div>

          {!summary ? (
            <button
              id="btn-run-document-understanding"
              onClick={() => onAnalyzeDocument(document.id)}
              disabled={isAnalyzing}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Legal Understanding...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate AI Document Understanding</span>
                </>
              )}
            </button>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Evidence-Indexed & Analyzed</span>
            </div>
          )}
        </div>

        {/* Overview callout if analyzed */}
        {summary && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-start space-x-3 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
              <div className="p-1 rounded bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 mt-0.5">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  What this document is & core purpose
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 mt-0.5 leading-relaxed">
                  {summary.overview}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 italic">
                  <strong>Core Purpose:</strong> {summary.corePurpose}
                </p>
              </div>
            </div>

            {/* Identified Parties */}
            {summary.parties && summary.parties.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center">
                  <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  Identified Parties:
                </span>
                {summary.parties.map((p, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                  >
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{p.name}</span>
                    <span className="text-slate-400">({p.role})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* If not analyzed, show prominent callout */}
      {!summary && !isAnalyzing && (
        <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-8 text-center">
          <Sparkles className="w-10 h-10 text-indigo-600 dark:text-indigo-400 mx-auto mb-3" />
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Structured Understanding Ready to Generate
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-lg mx-auto">
            LexiGuide will extract obligations, rights, termination protocols, financial mechanics, and unusual clauses, linking every item directly to verifiable citations.
          </p>
          <button
            onClick={() => onAnalyzeDocument(document.id)}
            className="mt-4 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-all"
          >
            Start Document Understanding
          </button>
        </div>
      )}

      {/* Sub-tabs for Structured Understanding */}
      {summary && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          {/* Tabs header */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50/60 dark:bg-slate-800/40 px-3">
            {[
              { id: 'overview', label: 'Major Sections', count: summary.majorSections?.length },
              { id: 'obligations', label: 'Key Obligations', count: summary.majorObligations?.length },
              { id: 'rights', label: 'Key Rights', count: summary.majorRights?.length },
              { id: 'dates', label: 'Important Dates', count: summary.importantDates?.length },
              { id: 'financial', label: 'Financial Terms', count: summary.financialTerms?.length },
              { id: 'termination', label: 'Termination / Exit', count: summary.terminationProvisions?.length },
              { id: 'unusual', label: 'Unusual Clauses', count: summary.unusualClauses?.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSectionTab(tab.id as any)}
                className={`py-3 px-3.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  activeSectionTab === tab.id
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeSectionTab === tab.id
                      ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab contents */}
          <div className="p-5">
            {/* 1. Major Sections */}
            {activeSectionTab === 'overview' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Major Contract Sections & Core Topics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.majorSections?.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {sec.title}
                        </h4>
                        <button
                          onClick={() => onOpenEvidence(sec.chunkId || '', sec.citation)}
                          className="flex items-center space-x-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
                          title="Click to inspect exact verbatim clause"
                        >
                          <span>{sec.citation || 'Evidence'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">
                        {sec.summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Key Obligations */}
            {activeSectionTab === 'obligations' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Extracted Mandatory Obligations
                  </h3>
                  <span className="text-[11px] text-slate-500">Every obligation links to source evidence</span>
                </div>
                <div className="space-y-2.5">
                  {summary.majorObligations?.map((ob, idx) => {
                    const isHigh = ob.urgency === 'high';
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                            isHigh
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          }`}>
                            {ob.urgency}
                          </span>
                          <div>
                            <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                              {ob.obligation}
                            </p>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400">
                              Obligated Party: <strong className="text-slate-700 dark:text-slate-300">{ob.party}</strong>
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onOpenEvidence(ob.chunkId || '', ob.citation)}
                          className="self-start sm:self-center flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                        >
                          <span>{ob.citation || 'View Citation'}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 3. Key Rights */}
            {activeSectionTab === 'rights' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Guaranteed Protections & Statutory/Contractual Rights
                </h3>
                <div className="space-y-2.5">
                  {summary.majorRights?.map((rt, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <span className="p-1 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <ShieldCheck className="w-3.5 h-3.5" />
                        </span>
                        <div>
                          <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                            {rt.right}
                          </p>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            Beneficiary: <strong className="text-slate-700 dark:text-slate-300">{rt.party}</strong>
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenEvidence(rt.chunkId || '', rt.citation)}
                        className="self-start sm:self-center flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                      >
                        <span>{rt.citation || 'View Citation'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Important Dates */}
            {activeSectionTab === 'dates' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Critical Deadlines, Renewal Triggers & Notice Periods
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {summary.importantDates?.map((dt, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-2"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mt-0.5">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                            {dt.dateOrPeriod}
                          </span>
                          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                            {dt.description}
                          </p>
                          <span className="inline-block mt-1 text-[10px] uppercase font-bold text-slate-500 bg-slate-200/70 dark:bg-slate-700/60 px-1.5 py-0.2 rounded">
                            {dt.type}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenEvidence(dt.chunkId || '', dt.citation)}
                        className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline whitespace-nowrap mt-1"
                      >
                        {dt.citation || 'Inspect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Financial Terms */}
            {activeSectionTab === 'financial' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Compensation, Fees, Deductions & Financial Mechanics
                </h3>
                <div className="space-y-2.5">
                  {summary.financialTerms?.map((ft, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div className="flex items-start space-x-2.5">
                        <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <DollarSign className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {ft.term}
                          </span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                            {ft.details}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => onOpenEvidence(ft.chunkId || '', ft.citation)}
                        className="self-start sm:self-center flex items-center space-x-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors whitespace-nowrap"
                      >
                        <span>{ft.citation || 'Citation'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Termination / Exit Provisions */}
            {activeSectionTab === 'termination' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Termination Protocols, Severance, & Exit Clauses
                </h3>
                <div className="space-y-2.5">
                  {summary.terminationProvisions?.map((tp, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {tp.description}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenEvidence(tp.chunkId || '', tp.citation)}
                          className="flex items-center space-x-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
                        >
                          <span>{tp.citation || 'Evidence'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      <div className="mt-2 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div>
                          <strong>Notice Period:</strong> {tp.noticePeriod || 'Not specified'}
                        </div>
                        <div>
                          <strong>Grounds / Conditions:</strong> {tp.conditions}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Unusual Clauses */}
            {activeSectionTab === 'unusual' && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-amber-500">
                  Potentially Significant or High-Attention Provisions
                </h3>
                <div className="space-y-2.5">
                  {summary.unusualClauses?.map((uc, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-amber-200/80 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            {uc.title}
                          </span>
                        </div>
                        <button
                          onClick={() => onOpenEvidence(uc.chunkId || '', uc.citation)}
                          className="flex items-center space-x-1 text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800/50 hover:bg-indigo-100 transition-colors"
                        >
                          <span>{uc.citation || 'Evidence'}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                        {uc.whySignificant}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
