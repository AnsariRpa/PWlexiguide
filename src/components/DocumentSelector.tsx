/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  FileText,
  Trash2,
  Upload,
  Layers,
  Sparkles,
  BookOpen,
  Briefcase,
  Home,
  Cloud
} from 'lucide-react';
import { DocumentItem } from '../types';
import { SAMPLE_DOCUMENT_BUNDLES } from '../data/sampleLegalDocs';

interface DocumentSelectorProps {
  documents: DocumentItem[];
  activeDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onOpenUpload: () => void;
  onLoadSampleBundle: (bundleId: string) => void;
  isLoading: boolean;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
  documents,
  activeDocumentId,
  onSelectDocument,
  onDeleteDocument,
  onOpenUpload,
  onLoadSampleBundle,
  isLoading
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 sm:p-5 mb-6">
      {/* Top row: Title and Sample Loaders */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center space-x-2">
            <Layers className="w-4 h-4 text-indigo-500" />
            <span>Workspace Legal Documents ({documents.length})</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Select a document to inspect or load a pre-configured legal bundle to explore immediately.
          </p>
        </div>

        {/* Quick Sample Bundles */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 flex items-center">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1" />
            Sample Sets:
          </span>
          <button
            onClick={() => onLoadSampleBundle('bundle-employment-equity')}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Load Executive Offer Letter, Proprietary Inventions & Stock Option Plan"
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
            <span>Employment & Equity</span>
          </button>

          <button
            onClick={() => onLoadSampleBundle('bundle-lease-residential')}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Load Residential Tenancy Agreement & Pet/Rules Addendum"
          >
            <Home className="w-3.5 h-3.5 text-emerald-500" />
            <span>Residential Lease</span>
          </button>

          <button
            onClick={() => onLoadSampleBundle('bundle-saas-comparison')}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-colors"
            title="Load SaaS MSA v2.4 vs Proposed v3.0 (for Comparison)"
          >
            <Cloud className="w-3.5 h-3.5 text-blue-500" />
            <span>SaaS MSA v2 vs v3</span>
          </button>

          <button
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload PDF</span>
          </button>
        </div>
      </div>

      {/* Document Pills / Cards List */}
      <div className="mt-3.5">
        {documents.length === 0 ? (
          <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">No documents in this workspace</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Upload your own contract or lease, or click one of the sample sets above to begin instant legal analysis.
            </p>
            <div className="mt-4 flex justify-center space-x-3">
              <button
                onClick={() => onLoadSampleBundle('bundle-employment-equity')}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 shadow-sm"
              >
                Load Sample Employment Agreement
              </button>
              <button
                onClick={onOpenUpload}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Upload Custom Document
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {documents.map(doc => {
              const isSelected = activeDocumentId === doc.id;
              return (
                <div
                  key={doc.id}
                  id={`doc-card-${doc.id}`}
                  onClick={() => onSelectDocument(doc.id)}
                  className={`group relative p-3 rounded-lg border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-600/60 shadow-sm ring-1 ring-indigo-400/40'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <div className={`p-1.5 rounded-md mt-0.5 ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <div className="flex items-center space-x-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="capitalize px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700/60 font-medium">
                            {doc.category}
                          </span>
                          <span>•</span>
                          <span>{doc.totalPages} {doc.totalPages === 1 ? 'page' : 'pages'}</span>
                          <span>•</span>
                          <span>{doc.chunks.length} chunks</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 rounded transition-opacity"
                      title="Remove document from workspace"
                      aria-label={`Remove document ${doc.title}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {doc.summary && (
                    <div className="mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1"></span>
                      AI Analysis Cached
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
