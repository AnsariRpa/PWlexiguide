/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, Check, Loader2 } from 'lucide-react';
import { DocumentCategory } from '../types';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (payload: {
    title: string;
    category: DocumentCategory;
    fileType: 'text' | 'pdf';
    rawText?: string;
    base64Data?: string;
  }) => Promise<void>;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<DocumentCategory>('employment');
  const [rawText, setRawText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

  const validateAndSetFile = (file: File) => {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is 15 MB. Please upload a smaller document or paste text directly.`
      );
      setSelectedFile(null);
      return false;
    }

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isText = file.type.startsWith('text/') || /\.(txt|md|text|json|csv)$/i.test(file.name);

    if (!isPdf && !isText) {
      if (/\.(docx?|rtf|odt|pages)$/i.test(file.name)) {
        setErrorMessage(
          `Word documents (.docx / .doc) cannot be processed directly as raw binaries. Please export or save as PDF, or copy and paste the text into the "Paste Contract Text" tab.`
        );
      } else {
        setErrorMessage('Unsupported file format. Please upload a PDF or text file (.pdf, .txt, .md).');
      }
      setSelectedFile(null);
      return false;
    }

    setSelectedFile(file);
    if (!title) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setTitle(cleanName);
    }
    setErrorMessage(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Please provide a document title.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === 'file') {
        if (!selectedFile) {
          throw new Error('Please select a file to upload.');
        }

        const isPdf = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
        
        if (isPdf) {
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const base64Data = reader.result as string;
              await onUpload({
                title: title.trim(),
                category,
                fileType: 'pdf',
                base64Data
              });
              setIsSubmitting(false);
              onClose();
            } catch (err: any) {
              setErrorMessage(err.message || 'Failed to upload PDF.');
              setIsSubmitting(false);
            }
          };
          reader.readAsDataURL(selectedFile);
        } else {
          // Read as text
          const reader = new FileReader();
          reader.onload = async () => {
            try {
              const text = reader.result as string;
              await onUpload({
                title: title.trim(),
                category,
                fileType: 'text',
                rawText: text
              });
              setIsSubmitting(false);
              onClose();
            } catch (err: any) {
              setErrorMessage(err.message || 'Failed to upload text file.');
              setIsSubmitting(false);
            }
          };
          reader.readAsText(selectedFile);
        }
      } else {
        // Direct paste
        if (!rawText.trim()) {
          throw new Error('Please paste legal text into the field.');
        }
        await onUpload({
          title: title.trim(),
          category,
          fileType: 'text',
          rawText: rawText.trim()
        });
        setIsSubmitting(false);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process document.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 id="upload-modal-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">Add Legal Document</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">PDF, TXT, or markdown legal contracts and agreements</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close upload dialog"
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div role="tablist" aria-label="Upload method" className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-6 pt-2">
          <button
            role="tab"
            aria-selected={activeTab === 'file'}
            onClick={() => setActiveTab('file')}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'file'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Upload File (PDF / TXT)
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'text'}
            onClick={() => setActiveTab('text')}
            className={`pb-2 px-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'text'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            Paste Contract Text
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div role="alert" className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label htmlFor="input-doc-title" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Document Title *
            </label>
            <input
              id="input-doc-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Acme Corp Offer Letter & Compensation Terms"
              required
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="select-doc-category" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Legal Category
            </label>
            <select
              id="select-doc-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocumentCategory)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="employment">Employment & Labor (Offer, Invention, Non-Compete)</option>
              <option value="lease">Residential / Commercial Lease</option>
              <option value="nda">Non-Disclosure Agreement (NDA)</option>
              <option value="service">Master Services Agreement (MSA / SaaS)</option>
              <option value="policy">Terms of Service / Privacy Policy</option>
              <option value="general">General Contract / Other</option>
            </select>
          </div>

          {activeTab === 'file' ? (
            <div>
              <label htmlFor="file-input-upload" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select or Drop File
              </label>
              <div
                tabIndex={0}
                role="button"
                aria-label="Upload file area: click or drag and drop a PDF or TXT document"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  dragOver
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20'
                    : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <input
                  id="file-input-upload"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.md"
                  className="hidden"
                />
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                {selectedFile ? (
                  <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                      Click to choose file or drag and drop
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Supports PDF, TXT, Markdown (Max 15MB)
                    </p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="textarea-contract-text" className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Contract Text Content *
              </label>
              <textarea
                id="textarea-contract-text"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Paste the full text of the agreement here. Tip: Include markers like '--- Page 1 ---' or 'Section X' to enrich chunk citation metadata."
                rows={7}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              ></textarea>
            </div>
          )}

          <div className="pt-2 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow transition-colors flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Processing & Chunking...' : 'Add Document'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
