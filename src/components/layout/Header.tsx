import React from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Database, 
  Share2, 
  Layout, 
  Settings, 
  Download,
  Sun,
  Moon,
  Plus
} from 'lucide-react';
import { ViewMode, Page, Database as DatabaseType, CanvasBoard } from '../../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  activePage?: Page;
  activeDatabase?: DatabaseType;
  activeCanvas?: CanvasBoard;
  isAiOpen: boolean;
  setIsAiOpen: (open: boolean) => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenExport: () => void;
  onNewNote: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  activePage,
  activeDatabase,
  activeCanvas,
  isAiOpen,
  setIsAiOpen,
  onOpenSearch,
  onOpenSettings,
  onOpenExport,
  onNewNote,
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="h-[52px] border-b border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#171717] px-4 md:px-6 flex items-center justify-between select-none z-30 transition-colors">
      {/* Brand & Context Breadcrumb */}
      <div className="flex items-center space-x-3">
        <div 
          onClick={() => setViewMode('doc')}
          className="flex items-center space-x-2 cursor-pointer group"
        >
          {/* Hand-drawn / line llama mascot / geometric mark */}
          <div className="w-7 h-7 rounded-full bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-xs tracking-tighter transition-transform group-hover:scale-105">
            M
          </div>
          <span className="font-heading font-bold text-sm tracking-tight text-black dark:text-white">
            Mindora
          </span>
        </div>

        <span className="text-[#d4d4d4] dark:text-[#3f3f3f] font-mono text-xs">/</span>

        {/* View / Document Context */}
        <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-[#737373] dark:text-[#a3a3a3]">
          {viewMode === 'doc' && (
            <span className="text-black dark:text-white truncate max-w-[200px]">
              {activePage?.title || 'Untitled Note'}
            </span>
          )}
          {viewMode === 'base' && (
            <span className="text-black dark:text-white truncate max-w-[200px]">
              {activeDatabase?.title || 'Collection Base'}
            </span>
          )}
          {viewMode === 'graph' && (
            <span className="text-black dark:text-white">
              Knowledge Graph
            </span>
          )}
          {viewMode === 'canvas' && (
            <span className="text-black dark:text-white truncate max-w-[200px]">
              {activeCanvas?.title || 'Canvas Board'}
            </span>
          )}
        </div>
      </div>

      {/* Center Search Pill (Ollama search-pill style) */}
      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <button
          onClick={onOpenSearch}
          className="search-pill w-full justify-between"
          title="Search workspace (Cmd+K)"
        >
          <div className="flex items-center gap-2 text-[#737373] dark:text-[#a3a3a3]">
            <Search size={14} />
            <span className="text-xs">Search docs, bases, or graph...</span>
          </div>
          <kbd className="hidden sm:inline-block font-mono text-[10px] bg-white dark:bg-[#171717] px-1.5 py-0.5 rounded border border-[#e5e5e5] dark:border-[#333] text-[#737373] dark:text-[#a3a3a3]">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* View Switchers & Primary Action Pills */}
      <div className="flex items-center space-x-2">
        {/* Navigation Mode Pills */}
        <div className="hidden lg:flex items-center space-x-1 p-0.5 rounded-full border border-[#e5e5e5] dark:border-[#2e2e2e] bg-[#fafafa] dark:bg-[#1f1f1f]">
          <button
            onClick={() => setViewMode('doc')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'doc'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Docs
          </button>
          <button
            onClick={() => setViewMode('base')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'base'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Bases
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'graph'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Graph
          </button>
          <button
            onClick={() => setViewMode('canvas')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              viewMode === 'canvas'
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white'
            }`}
          >
            Canvas
          </button>
        </div>

        {/* Quick New Note Button */}
        <button
          onClick={onNewNote}
          className="btn-pill-primary btn-pill-sm"
          title="Create a new document"
        >
          <Plus size={13} />
          <span>Note</span>
        </button>

        {/* AI Assistant Pill Toggle */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`btn-pill btn-pill-sm ${
            isAiOpen 
              ? 'btn-pill-active' 
              : 'hover:border-black dark:hover:border-white'
          }`}
          title="Toggle AI Assistant"
        >
          <Sparkles size={12} className={isAiOpen ? 'text-white dark:text-black' : 'text-[#737373] dark:text-[#a3a3a3]'} />
          <span>AI</span>
        </button>

        {/* Vault / Backup Pill */}
        <button
          onClick={onOpenExport}
          className="btn-pill btn-pill-sm hidden sm:inline-flex"
          title="Import vault or export backup"
        >
          <Download size={12} />
          <span>Vault</span>
        </button>

        {/* Theme Toggle Pill */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="btn-pill btn-pill-sm p-1.5"
          title={darkMode ? 'Switch to Paper White Light Mode' : 'Switch to Inverted Dark Mode'}
        >
          {darkMode ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* Settings Pill */}
        <button
          onClick={onOpenSettings}
          className="btn-pill btn-pill-sm p-1.5"
          title="Workspace Settings & API Keys"
        >
          <Settings size={13} />
        </button>
      </div>
    </header>
  );
};
