/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldAlert, Info, CheckCircle2, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

export const SafetyDisclaimerBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside aria-label="Legal information disclaimer" className="bg-slate-900/90 border-b border-amber-500/20 text-slate-300 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <ShieldAlert className="w-3.5 h-3.5" />
          </span>
          <p className="font-medium text-slate-200">
            <strong className="text-amber-300 font-semibold">Legal Notice:</strong> LexiGuide provides legal information and document comprehension assistance. It does <span className="underline decoration-amber-400/60 font-semibold">not</span> provide legal advice and does not replace a licensed attorney.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          {/* Visual Trust Legend Toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center space-x-1 text-[11px] font-medium text-slate-400 hover:text-indigo-300 transition-colors"
          >
            <span>Evidence Trust Legend</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-[11px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-slate-400">
          <div className="flex items-center space-x-2 bg-slate-800/60 p-1.5 rounded border border-slate-700/60">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
            <div>
              <span className="font-semibold text-slate-200">Document Evidence</span>
              <p className="text-[10px] text-slate-400">Directly quoted clauses with page & line metadata</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/60 p-1.5 rounded border border-indigo-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <div>
              <span className="font-semibold text-indigo-200">AI Interpretation</span>
              <p className="text-[10px] text-slate-400">Plain-language reasoning & implications</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/60 p-1.5 rounded border border-teal-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
            <div>
              <span className="font-semibold text-teal-200">External Statutory Knowledge</span>
              <p className="text-[10px] text-slate-400">Google Search grounded jurisdiction rules</p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/60 p-1.5 rounded border border-amber-500/30">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <div>
              <span className="font-semibold text-amber-200">Information Gap / Uncertainty</span>
              <p className="text-[10px] text-slate-400">Unstated terms requiring clarification</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
