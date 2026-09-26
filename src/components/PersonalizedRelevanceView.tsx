/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  MessageSquare,
  FileQuestion,
  Loader2,
  ShieldQuestion,
  CornerDownRight
} from 'lucide-react';
import { PersonalizedRelevanceMap, DocumentItem, GapClassification } from '../types';

interface PersonalizedRelevanceViewProps {
  documents: DocumentItem[];
  relevanceMap: PersonalizedRelevanceMap | null;
  onAnalyzeRelevance: (concernPrompt: string) => Promise<void>;
  onOpenEvidence: (chunkId: string, citationText?: string) => void;
  isAnalyzing: boolean;
  sampleConcerns?: string[];
}

export const PersonalizedRelevanceView: React.FC<PersonalizedRelevanceViewProps> = ({
  documents,
  relevanceMap,
  onAnalyzeRelevance,
  onOpenEvidence,
  isAnalyzing,
  sampleConcerns = []
}) => {
  const [concernInput, setConcernInput] = useState('');

  const defaultSampleConcerns = sampleConcerns.length > 0 ? sampleConcerns : [
    'What happens to my compensation, unvested stock options, and benefits if I leave or get laid off?',
    'Can I work on personal open-source software or side projects on weekends without company claiming ownership?',
    'Does the agreement contain non-compete or non-solicitation restrictions after departure, and are they enforceable?',
    'What are my move-out notice obligations and conditions to get my full security deposit returned?'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concernInput.trim() || isAnalyzing) return;
    onAnalyzeRelevance(concernInput.trim());
  };

  const handleSelectPreset = (preset: string) => {
    setConcernInput(preset);
    onAnalyzeRelevance(preset);
  };

  const getGapBadge = (classification: GapClassification) => {
    switch (classification) {
      case 'explicitly_stated':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Explicitly Stated</span>
          </span>
        );
      case 'indirectly_relevant':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
            <HelpCircle className="w-3 h-3" />
            <span>Indirectly Relevant</span>
          </span>
        );
      case 'not_established':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3" />
            <span>Not Established in Text</span>
          </span>
        );
      case 'requires_external_info':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <ShieldQuestion className="w-3 h-3" />
            <span>Requires External Law / Context</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Concept Explanation */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-inner">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              What Matters To You: Personalized Legal Relevance Map
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Generic summaries leave too much noise. Tell LexiGuide your primary concern, and Gemini will map exact clauses, obligations, and critical information gaps specifically for your situation.
            </p>
          </div>
        </div>

        {/* Concern Input Form */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="relative">
            <textarea
              id="input-personal-concern"
              aria-label="What matters most to you in these legal documents"
              value={concernInput}
              onChange={(e) => setConcernInput(e.target.value)}
              placeholder="What matters most to you? (e.g. 'What happens to my stock options and severance if I resign?', 'Can I code side projects on weekends?', 'What are my repair responsibilities?')"
              rows={3}
              className="w-full px-4 py-3 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none pr-28 resize-none shadow-inner"
            ></textarea>
            <button
              id="btn-analyze-relevance"
              type="submit"
              aria-label="Map personal relevance across documents"
              disabled={isAnalyzing || !concernInput.trim() || documents.length === 0}
              className="absolute right-3 bottom-3 inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white text-xs font-semibold shadow transition-all disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mapping...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Map Relevance</span>
                </>
              )}
            </button>
          </div>

          {/* Quick presets */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-1" />
              Suggested Scenarios:
            </span>
            {defaultSampleConcerns.slice(0, 3).map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className="text-left text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors truncate max-w-xs"
                title={preset}
              >
                {preset}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Results View */}
      {relevanceMap ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Synthesized User Intent Profile */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 border border-indigo-500/20 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
            <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 text-[11px] block">
              Inferred Personal Priority Profile
            </span>
            <p className="mt-1 font-medium leading-relaxed">
              {relevanceMap.concernSummary}
            </p>
          </div>

          {/* Relevant Clauses Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-1.5">
                <Target className="w-4 h-4 text-indigo-500" />
                <span>Relevant Clauses & Practical Implications ({relevanceMap.relevantItems?.length || 0})</span>
              </h3>
              <span className="text-[11px] text-slate-400">Click any citation to inspect source text</span>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {relevanceMap.relevantItems?.map((item) => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-indigo-400 dark:hover:border-indigo-600/70 transition-colors"
                >
                  {/* Top Bar: Topic, Priority Pill, Gap Classification, Citation */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.relevanceLevel === 'critical'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                          : item.relevanceLevel === 'high'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.relevanceLevel} relevance
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {item.topic}
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      {getGapBadge(item.gapClassification)}
                      <button
                        onClick={() => onOpenEvidence(item.chunkId || '', item.citation)}
                        className="inline-flex items-center space-x-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-200 dark:border-indigo-800/60 hover:bg-indigo-100 transition-colors"
                        title="Inspect exact source clause"
                      >
                        <span>{item.citation || 'Evidence'}</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Body: What Document Says vs What This Means For You */}
                  <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* What the document says (factual evidence) */}
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        What the document says (Evidence)
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {item.whatDocumentSays}
                      </p>
                    </div>

                    {/* What this means for you (personalized interpretation) */}
                    <div className="p-3 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-900/40">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block mb-1">
                        What this means for your situation
                      </span>
                      <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                        {item.whatItMeansForUser}
                      </p>
                    </div>
                  </div>

                  {/* Gap Notes & Recommended Question */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    {item.gapNotes && (
                      <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-start space-x-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Gap Context:</strong> {item.gapNotes}</span>
                      </div>
                    )}

                    {item.recommendedQuestion && (
                      <div className="bg-slate-100 dark:bg-slate-800/80 p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] flex items-start space-x-1.5 self-stretch sm:self-auto sm:max-w-md">
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <span><strong>Question to raise:</strong> "{item.recommendedQuestion}"</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explicit Information Gaps Section (Section 11) */}
          {relevanceMap.informationGaps && relevanceMap.informationGaps.length > 0 && (
            <div className="bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/50 p-5">
              <div className="flex items-center space-x-2">
                <FileQuestion className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Critical Information Gaps (What the Documents Do NOT Establish)
                </h3>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                The application does not invent answers when documents are silent. These essential details are omitted from the uploaded texts and require clarification:
              </p>

              <div className="mt-3.5 space-y-2.5">
                {relevanceMap.informationGaps.map((gap, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {gap.missingTopic}
                      </span>
                      {getGapBadge(gap.gapClassification)}
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      <strong>Why this matters:</strong> {gap.whyItMatters}
                    </p>
                    <div className="mt-2 text-[11px] text-indigo-600 dark:text-indigo-400 flex items-center space-x-1">
                      <CornerDownRight className="w-3 h-3" />
                      <span><strong>Recommended next step:</strong> {gap.recommendedNextStep}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !isAnalyzing && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
            <Target className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              No active relevance map yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Enter what matters to you in the prompt above, or select one of the suggested scenarios to generate your personalized legal relevance map.
            </p>
          </div>
        )
      )}
    </div>
  );
};
