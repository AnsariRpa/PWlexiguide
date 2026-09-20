/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Check, X, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const WhyLexiGuideCard: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div className="bg-slate-900 text-slate-100 rounded-xl border border-slate-800 p-4 sm:p-5 shadow-sm">
      <div
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-white flex items-center space-x-2">
              <span>Why LexiGuide is Not a Generic Chatbot</span>
              <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-2 py-0.2 rounded-full border border-indigo-500/30">
                Core Differentiator
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Built specifically for legal safety, verifiable citations, and information gap transparency
            </p>
          </div>
        </div>

        <button
          className="text-slate-400 hover:text-slate-200 p-1"
          aria-label={collapsed ? "Expand comparison details" : "Collapse comparison details"}
        >
          {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs animate-in fade-in duration-150">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 space-y-2">
            <div className="flex items-center space-x-1.5 text-rose-400 font-semibold text-xs">
              <X className="w-4 h-4" />
              <span>Generic Chatbots</span>
            </div>
            <ul className="space-y-1.5 text-slate-400 text-[11px]">
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-400">•</span>
                <span>Hallucinate answers when agreements are silent or ambiguous</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-400">•</span>
                <span>Vague, unclickable answers with no page or paragraph traceability</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-400">•</span>
                <span>Lacks structured understanding (misses critical obligations & dates)</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-400">•</span>
                <span>High risk of prompt injection and confusing advice with information</span>
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-500/30 space-y-2">
            <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-xs">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>LexiGuide Legal Workspace</span>
            </div>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">•</span>
                <span><strong>Explicit Information Gap detection:</strong> Transparently identifies what documents do NOT establish</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">•</span>
                <span><strong>Verifiable Evidence Inspector:</strong> Every claim links to exact page, line, and verbatim chunk</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">•</span>
                <span><strong>Personalized Relevance Map:</strong> Tailored to your specific question, not generic summaries</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400">•</span>
                <span><strong>Actionable Outputs:</strong> Export ready-to-print Attorney Consultation Briefs & checklist</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
