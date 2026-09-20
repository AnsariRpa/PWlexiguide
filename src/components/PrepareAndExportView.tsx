/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Printer,
  Copy,
  Check,
  Sparkles,
  CheckSquare,
  Square,
  MessageSquare,
  Calendar,
  Loader2,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { ActionableOutputs, DocumentItem } from '../types';

interface PrepareAndExportViewProps {
  documents: DocumentItem[];
  outputs: ActionableOutputs | null;
  onGenerateOutputs: (userConcern?: string) => Promise<void>;
  isGenerating: boolean;
  onOpenEvidence: (chunkId: string, citationText?: string) => void;
}

export const PrepareAndExportView: React.FC<PrepareAndExportViewProps> = ({
  documents,
  outputs,
  onGenerateOutputs,
  isGenerating,
  onOpenEvidence
}) => {
  const [copiedBrief, setCopiedBrief] = useState(false);
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});
  const [customConcern, setCustomConcern] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'brief' | 'checklist' | 'questions'>('brief');

  const handleToggleCheck = (id: string) => {
    setCompletedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyBrief = () => {
    if (!outputs) return;
    const b = outputs.consultationBrief;
    const text = `
=== LEXIGUIDE LEGAL CONSULTATION BRIEF ===
Title: ${b.title}
Generated: ${new Date().toLocaleDateString()}
Notice: This document provides legal information and preparation assistance; not formal legal advice.

CLIENT CONTEXT & PRIMARY CONCERN:
${b.clientContext}

KEY FACTUAL PREMISES:
${b.keyFacts?.map((fact, i) => `${i + 1}. ${fact}`).join('\n')}

CORE ISSUES & PROVISIONS TO EXAMINE:
${b.coreIssues?.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

RELEVANT CLAUSES & CITATIONS:
${b.relevantClausesWithCitations?.map((item, i) => `${i + 1}. ${item.clause} [Citation: ${item.citation}]`).join('\n')}

QUESTIONS FOR COUNSEL:
${b.questionsForCounsel?.map((q, i) => `${i + 1}. ${q}`).join('\n')}

RECOMMENDED ACTION ITEMS:
${b.actionItems?.map((a, i) => `${i + 1}. ${a}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedBrief(true);
    setTimeout(() => setCopiedBrief(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-inner">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Prepare & Export: Actionable Legal Pack
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transform complex contract understanding into an attorney-ready Consultation Brief, actionable execution checklist, and stakeholder question matrix.
              </p>
            </div>
          </div>

          <button
            id="btn-generate-actionable-pack"
            onClick={() => onGenerateOutputs(customConcern)}
            disabled={isGenerating || documents.length === 0}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Compiling Legal Brief...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>{outputs ? 'Regenerate Legal Pack' : 'Generate Legal Pack'}</span>
              </>
            )}
          </button>
        </div>

        {/* Optional Custom Concern */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Focus Brief On Specific Scenario (Optional):
          </label>
          <input
            type="text"
            value={customConcern}
            onChange={(e) => setCustomConcern(e.target.value)}
            placeholder="e.g. Focus on IP ownership and post-employment covenants, or deposit refund timeline"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Outputs Workspace */}
      {outputs ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Sub tabs & Print / Copy buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveSubTab('brief')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'brief'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Attorney Consultation Brief
              </button>
              <button
                onClick={() => setActiveSubTab('checklist')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'checklist'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Action Checklist ({outputs.actionChecklist?.length || 0})
              </button>
              <button
                onClick={() => setActiveSubTab('questions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  activeSubTab === 'questions'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Questions Matrix ({outputs.questionsToAsk?.length || 0})
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                id="btn-copy-brief"
                onClick={handleCopyBrief}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                title="Copy plain text summary to clipboard"
              >
                {copiedBrief ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedBrief ? 'Copied to Clipboard' : 'Copy Brief'}</span>
              </button>

              <button
                id="btn-print-brief"
                onClick={handlePrint}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors"
                title="Print Consultation Brief"
              >
                <Printer className="w-3.5 h-3.5 text-slate-400" />
                <span>Print</span>
              </button>
            </div>
          </div>

          {/* SubTab 1: Attorney Consultation Brief */}
          {activeSubTab === 'brief' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 print:border-none print:shadow-none">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {outputs.consultationBrief.title || 'Legal Consultation Brief'}
                  </h3>
                  <span className="text-xs text-slate-400">LexiGuide Verified</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Prepared for legal counsel / professional review
                </p>
              </div>

              {/* Client Context */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Client Context & Target Goals
                </span>
                <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {outputs.consultationBrief.clientContext}
                </p>
              </div>

              {/* Key Facts */}
              {outputs.consultationBrief.keyFacts?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Key Factual Premises
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {outputs.consultationBrief.keyFacts.map((fact: string, idx: number) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Core Issues to Discuss */}
              {outputs.consultationBrief.coreIssues?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Core Issues to Examine
                  </h4>
                  <div className="space-y-2">
                    {outputs.consultationBrief.coreIssues.map((issue: string, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 text-xs font-medium text-slate-900 dark:text-slate-100 flex items-start space-x-2"
                      >
                        <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                        <span>{issue}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Clauses with Citations */}
              {outputs.consultationBrief.relevantClausesWithCitations?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Key Clauses with Document Citations
                  </h4>
                  <div className="space-y-2">
                    {outputs.consultationBrief.relevantClausesWithCitations.map((item: { clause: string; citation: string }, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/20 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-800 dark:text-slate-200 font-medium">
                          {item.clause}
                        </span>
                        <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800 whitespace-nowrap ml-2">
                          {item.citation}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Questions for Counsel */}
              {outputs.consultationBrief.questionsForCounsel?.length > 0 && (
                <div className="p-4 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-200/80 dark:border-indigo-900/40">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2 flex items-center space-x-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Prepared Questions For Counsel</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {outputs.consultationBrief.questionsForCounsel.map((q: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-indigo-500 font-bold">{i + 1}.</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Items */}
              {outputs.consultationBrief.actionItems?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-2">
                    Pre-Consultation Action Items
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    {outputs.consultationBrief.actionItems.map((action: string, i: number) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="text-emerald-500 font-bold">•</span>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* SubTab 2: Action Checklist */}
          {activeSubTab === 'checklist' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Your Legal Action Checklist
              </h3>
              <div className="space-y-2.5">
                {outputs.actionChecklist?.map((item) => {
                  const isDone = completedItems[item.id] !== undefined ? completedItems[item.id] : item.completed;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleCheck(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                        isDone
                          ? 'bg-slate-50/60 dark:bg-slate-800/20 border-slate-200/60 opacity-60'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-400'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <button
                          type="button"
                          className="mt-0.5 text-emerald-600 focus:outline-none"
                          aria-label={`Mark ${item.task} as ${isDone ? 'incomplete' : 'complete'}`}
                        >
                          {isDone ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                        </button>
                        <div>
                          <p className={`text-xs font-semibold ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {item.task}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {item.details}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                            <span className="capitalize px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                              {item.category?.replace(/_/g, ' ')}
                            </span>
                            {item.dueOrTiming && (
                              <span className="flex items-center text-amber-600 dark:text-amber-400 font-medium">
                                <Calendar className="w-3 h-3 mr-1" />
                                Timing: {item.dueOrTiming}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SubTab 3: Stakeholder Questions Matrix */}
          {activeSubTab === 'questions' && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Targeted Questions by Counterparty
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {outputs.questionsToAsk?.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400">
                        Recipient: {q.recipient}
                      </span>
                      {q.targetClauseCitation && (
                        <span className="text-[10px] text-slate-400">
                          {q.targetClauseCitation}
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm">
                      "{q.question}"
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Context:</strong> {q.context}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !isGenerating && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
            <FileCheck2 className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No Actionable Pack Generated Yet
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              Click the "Generate Legal Pack" button above to prepare an attorney-ready Consultation Brief, execution checklist, and stakeholder question matrix.
            </p>
          </div>
        )
      )}
    </div>
  );
};
