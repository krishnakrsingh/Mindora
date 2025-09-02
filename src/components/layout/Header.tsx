import React from 'react';
import { 
  Search, 
  Sparkles, 
  FileText, 
  Database, 
  Share2, 
  Layout, 
  Sun, 
  Moon, 
  Settings, 
  ChevronRight,
  Download
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
  darkMode,
  setDarkMode,
}) => {
  return (
    <header className="h-12 border-b border-white/5 bg-[#121318]/90 backdrop-blur-md px-4 flex items-center justify-between select-none z-30">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-slate-400">
        <span className="font-medium text-slate-300">Mindora</span>
        <ChevronRight size={14} className="text-slate-600" />
        {viewMode === 'doc' && activePage && (
          <span className="flex items-center space-x-1.5 text-slate-200 font-medium">
            <span>{activePage.icon || '📄'}</span>
            <span className="truncate max-w-[200px]">{activePage.title}</span>
          </span>
        )}
        {viewMode === 'base' && activeDatabase && (
          <span className="flex items-center space-x-1.5 text-slate-200 font-medium">
            <span>{activeDatabase.icon || '📊'}</span>
            <span className="truncate max-w-[200px]">{activeDatabase.title}</span>
          </span>
        )}
        {viewMode === 'graph' && (
          <span className="flex items-center space-x-1.5 text-indigo-400 font-medium">
            <Share2 size={14} />
            <span>Knowledge Graph</span>
          </span>
        )}
        {viewMode === 'canvas' && (
          <span className="flex items-center space-x-1.5 text-purple-400 font-medium">
            <Layout size={14} />
            <span>{activeCanvas?.title || 'Visual Canvas'}</span>
          </span>
        )}
      </div>

      {/* View Switcher Pills */}
      <div className="flex items-center bg-[#1a1b23] p-0.5 rounded-lg border border-white/5 text-xs font-medium">
        <button
          onClick={() => setViewMode('doc')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'doc'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Document Workspace"
        >
          <FileText size={13} />
          <span>Notes</span>
        </button>

        <button
          onClick={() => setViewMode('base')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'base'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Relational Databases"
        >
          <Database size={13} />
          <span>Bases</span>
        </button>

        <button
          onClick={() => setViewMode('graph')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'graph'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Knowledge Graph"
        >
          <Share2 size={13} />
          <span>Graph</span>
        </button>

        <button
          onClick={() => setViewMode('canvas')}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-all ${
            viewMode === 'canvas'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          title="Infinite Canvas"
        >
          <Layout size={13} />
          <span>Canvas</span>
        </button>
      </div>

      {/* Global Actions */}
      <div className="flex items-center space-x-1.5">
        {/* Command Search Button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#1a1b23] border border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs transition-colors"
          title="Search or Jump (Cmd+K)"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Search</span>
          <kbd className="px-1.5 py-0.5 text-[10px] bg-white/5 rounded border border-white/10 text-slate-400">⌘K</kbd>
        </button>

        {/* Export Button */}
        <button
          onClick={onOpenExport}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Vault Import / Export"
        >
          <Download size={15} />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Settings Button */}
        <button
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
          title="Workspace Settings"
        >
          <Settings size={15} />
        </button>

        {/* AI Panel Toggle */}
        <button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
            isAiOpen
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
              : 'bg-[#1a1b23] text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/10'
          }`}
          title="Toggle Mindora AI"
        >
          <Sparkles size={13} className={isAiOpen ? 'animate-pulse' : ''} />
          <span>Mindora AI</span>
        </button>
      </div>
    </header>
  );
};

