/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  GitCompare,
  Sparkles,
  ArrowRight,
  ExternalLink,
  AlertCircle,
  FileText,
  Loader2,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { DocumentItem, DocumentComparisonResult } from '../types';

interface DocumentComparisonViewProps {
  documents: DocumentItem[];
  comparison: DocumentComparisonResult | null;
  onCompare: (doc1Id: string, doc2Id: string) => Promise<void>;
  onOpenEvidence: (chunkId: string, citationText?: string) => void;
  isComparing: boolean;
}

export const DocumentComparisonView: React.FC<DocumentComparisonViewProps> = ({
  documents,
  comparison,
  onCompare,
  onOpenEvidence,
  isComparing
}) => {
  const [doc1Id, setDoc1Id] = useState<string>(documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(documents[1]?.id || documents[0]?.id || '');

  const handleRunComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc1Id || !doc2Id || doc1Id === doc2Id || isComparing) return;
    onCompare(doc1Id, doc2Id);
  };

  return (
    <div className="space-y-6">
      {/* Selector Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-inner">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Document Comparison: "What Changed?"
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select two versions of an agreement to analyze meaningful legal alterations, risk shifts, and wording changes with dual-cited evidence.
            </p>
          </div>
        </div>

        {documents.length < 2 ? (
          <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-700 dark:text-amber-400 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <strong className="font-semibold">Multiple documents needed:</strong> Please upload a second document or click the "SaaS MSA v2 vs v3" or "Employment & Equity" sample set above to compare.
            </div>
          </div>
        ) : (
          <form onSubmit={handleRunComparison} className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Document 1 (Base / Previous)
              </label>
              <select
                id="select-doc-1"
                value={doc1Id}
                onChange={(e) => setDoc1Id(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Document 2 (Updated / Revised)
              </label>
              <select
                id="select-doc-2"
                value={doc2Id}
                onChange={(e) => setDoc2Id(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              >
                {documents.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              id="btn-run-comparison"
              type="submit"
              disabled={isComparing || doc1Id === doc2Id}
              className="w-full py-2 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold shadow transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Meaningful Changes...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Compare Documents</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Comparison Results */}
      {comparison && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Executive Comparison Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
              Executive AI Change Summary
            </span>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
              {comparison.summaryOfDifferences}
            </p>
          </div>

          {/* Meaningful Changes Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Meaningful Substantive Changes ({comparison.changes?.length || 0})
            </h3>

            <div className="grid grid-cols-1 gap-3.5">
              {comparison.changes?.map((change, idx) => {
                const isHigh = change.impactLevel === 'high';
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          isHigh
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        }`}>
                          {change.impactLevel} impact
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {change.topic}
                        </h4>
                      </div>
                    </div>

                    {/* Side by side wording comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Doc 1 Wording */}
                      <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400">
                            Base: {comparison.doc1Name}
                          </span>
                          <button
                            onClick={() => onOpenEvidence(change.doc1ChunkId || '', change.doc1Citation)}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5"
                          >
                            <span>{change.doc1Citation || 'Citation'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{change.doc1Wording}"
                        </p>
                      </div>

                      {/* Doc 2 Wording */}
                      <div className="p-3 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400">
                            Revised: {comparison.doc2Name}
                          </span>
                          <button
                            onClick={() => onOpenEvidence(change.doc2ChunkId || '', change.doc2Citation)}
                            className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5"
                          >
                            <span>{change.doc2Citation || 'Citation'}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic">
                          "{change.doc2Wording}"
                        </p>
                      </div>
                    </div>

                    {/* What changed & Why it matters */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                      <div>
                        <strong className="text-slate-900 dark:text-slate-100">What Changed: </strong>
                        <span className="text-slate-700 dark:text-slate-300">{change.whatChanged}</span>
                      </div>
                      <div>
                        <strong className="text-indigo-600 dark:text-indigo-400">Why It Matters: </strong>
                        <span className="text-slate-700 dark:text-slate-300 font-medium">{change.whyItMatters}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
