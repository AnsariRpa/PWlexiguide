/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Scale,
  FileText,
  Target,
  MessageSquareText,
  GitCompare,
  FileCheck2,
  Upload,
  User,
  ShieldAlert
} from 'lucide-react';
import { UserSession } from '../types';

export type ActiveTab = 'workspace' | 'relevance' | 'ask' | 'compare' | 'prepare';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenUpload: () => void;
  currentUser: UserSession;
  onSwitchUser: () => void;
  documentCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenUpload,
  currentUser,
  onSwitchUser,
  documentCount
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'workspace', label: 'Workspace', icon: <FileText className="w-4 h-4" />, badge: documentCount > 0 ? `${documentCount}` : undefined },
    { id: 'relevance', label: 'What Matters To You', icon: <Target className="w-4 h-4" /> },
    { id: 'ask', label: 'Ask LexiGuide', icon: <MessageSquareText className="w-4 h-4" /> },
    { id: 'compare', label: 'Compare', icon: <GitCompare className="w-4 h-4" /> },
    { id: 'prepare', label: 'Prepare & Export', icon: <FileCheck2 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-slate-100 shadow-md">
      {/* Top Banner with Brand, Status, and Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Logo & Product Name */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-inner text-white">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold tracking-tight text-white">LexiGuide</span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Evidence-First Legal AI
              </span>
            </div>
            <p className="text-xs text-slate-400">Transforming complex legal texts into verified, actionable understanding</p>
          </div>
        </div>

        {/* Right Action Area: User switcher, Upload CTA */}
        <div className="flex items-center space-x-3">
          <button
            id="btn-header-upload"
            onClick={onOpenUpload}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-xs font-semibold text-white shadow transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
            title="Upload PDF or text legal documents"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Add Document</span>
          </button>

          {/* User Session Switcher */}
          <button
            id="btn-user-session"
            onClick={onSwitchUser}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
            title="Switch authenticated workspace profile"
          >
            <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-indigo-300">
              {currentUser.displayName.charAt(0)}
            </div>
            <span className="hidden sm:inline font-medium">{currentUser.displayName}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80">
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar" aria-label="Main Navigation">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
