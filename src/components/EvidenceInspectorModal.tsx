/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { DocumentChunk, DocumentItem } from '../types';

interface EvidenceInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chunkId: string | null;
  documents: DocumentItem[];
  citationLabel?: string;
}

export const EvidenceInspectorModal: React.FC<EvidenceInspectorModalProps> = ({
  isOpen,
  onClose,
  chunkId,
  documents,
  citationLabel
}) => {
  const [currentChunkId, setCurrentChunkId] = useState<string | null>(chunkId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCurrentChunkId(chunkId);
  }, [chunkId]);

  if (!isOpen || !currentChunkId) return null;

  // Find the target chunk across all documents
  let targetDoc: DocumentItem | null = null;
  let targetChunkIndex = -1;
  let targetChunk: DocumentChunk | null = null;

  for (const doc of documents) {
    const idx = doc.chunks.findIndex(c => c.id === currentChunkId);
    if (idx !== -1) {
      targetDoc = doc;
      targetChunkIndex = idx;
      targetChunk = doc.chunks[idx];
      break;
    }
  }

  // Fallback: If chunkId doesn't match an exact chunk id, take the first chunk of active doc
  if (!targetChunk && documents.length > 0) {
    targetDoc = documents[0];
    targetChunkIndex = 0;
    targetChunk = documents[0].chunks[0] || null;
  }

  const handleCopySnippet = () => {
    if (!targetChunk) return;
    navigator.clipboard.writeText(targetChunk.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = () => {
    if (targetDoc && targetChunkIndex > 0) {
      setCurrentChunkId(targetDoc.chunks[targetChunkIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (targetDoc && targetChunkIndex < targetDoc.chunks.length - 1) {
      setCurrentChunkId(targetDoc.chunks[targetChunkIndex + 1].id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="evidence-inspector-title"
      className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 border-l sm:border border-slate-200 dark:border-slate-800 sm:rounded-2xl max-w-2xl w-full h-full sm:h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 id="evidence-inspector-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Verifiable Evidence Inspector
                </h3>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  Verbatim Text
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-sm">
                {targetDoc?.title}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopySnippet}
              aria-label="Copy verbatim clause snippet to clipboard"
              className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
              title="Copy verbatim clause"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy Text'}</span>
            </button>

            <button
              onClick={onClose}
              aria-label="Close evidence inspector"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metadata Bar */}
        {targetChunk && (
          <div className="px-5 py-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-3 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                Page {targetChunk.pageNumber}
              </span>
              <span>•</span>
              <span className="font-medium truncate max-w-xs">{targetChunk.section}</span>
              {targetChunk.lineRange && (
                <>
                  <span>•</span>
                  <span className="text-slate-400">Lines {targetChunk.lineRange}</span>
                </>
              )}
            </div>

            {targetDoc && (
              <div className="flex items-center space-x-2 text-xs">
                <button
                  onClick={handlePrev}
                  disabled={targetChunkIndex <= 0}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  title="Previous clause"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-slate-500 font-medium">
                  {targetChunkIndex + 1} of {targetDoc.chunks.length}
                </span>
                <button
                  onClick={handleNext}
                  disabled={targetChunkIndex >= targetDoc.chunks.length - 1}
                  className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30"
                  title="Next clause"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {citationLabel && (
            <div className="text-xs p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-medium flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Referenced in inquiry as: <strong className="text-slate-900 dark:text-slate-100">{citationLabel}</strong></span>
            </div>
          )}

          {targetChunk ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 font-mono text-xs sm:text-[13px] leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
                {targetChunk.text}
              </div>

              <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 dark:border-blue-900/30 text-xs text-blue-900 dark:text-blue-200">
                <strong className="font-semibold">Evidence Integrity Note:</strong> The text displayed above is the exact verbatim string from the document chunking index. LexiGuide never alters original contractual terms.
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-sm">Clause content not found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex items-center justify-between text-xs text-slate-500">
          <span>Chunk ID: {targetChunk?.id || currentChunkId}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-medium transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
