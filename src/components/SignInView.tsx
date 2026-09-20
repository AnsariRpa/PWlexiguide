/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Scale, ShieldCheck, CheckCircle2, FileSearch, ArrowRight, Loader2 } from 'lucide-react';

interface SignInViewProps {
  onSignIn: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export const SignInView: React.FC<SignInViewProps> = ({ onSignIn, isLoading, error }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-950 text-slate-100">
      <div className="max-w-md w-full space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Scale className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            LexiGuide
          </h1>
          <p className="text-xs text-indigo-300 font-semibold tracking-wider uppercase">
            Evidence-First Legal AI Workspace
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            Deconstruct complex contracts, verify obligations against exact clause citations, and generate attorney-ready consultation briefs with zero-trust user isolation.
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span><strong>Zero-Trust Cloud Isolation:</strong> All documents, summaries, and analyses are securely persisted in Firestore partitioned by your verified Firebase UID.</span>
          </div>
          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span><strong>Verifiable Evidence Standard:</strong> Every conclusion points directly to verbatim contract lines, sections, and pages.</span>
          </div>
          <div className="flex items-start space-x-2.5 text-xs text-slate-300">
            <FileSearch className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span><strong>Pre-loaded Sample Bundles:</strong> Instantly explore executive employment packages, residential leases, and SaaS MSAs.</span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            id="btn-google-signin"
            onClick={onSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 active:scale-[0.99] text-slate-900 font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                <span>Authenticating with Google...</span>
              </>
            ) : (
              <>
                {/* Google "G" SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </>
            )}
          </button>
        </div>

        {/* Safety Disclaimer Notice */}
        <p className="text-[11px] text-slate-500 text-center leading-normal">
          LexiGuide is an informational and document preparation workspace, not a law firm, and does not provide formal legal advice. By signing in, your data remains strictly isolated in your personal account.
        </p>
      </div>
    </div>
  );
};
