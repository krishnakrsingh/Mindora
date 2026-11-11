import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Database, 
  Share2, 
  Layout, 
  Settings, 
  Plus, 
  Sparkles,
  Command,
  ArrowRight
} from 'lucide-react';
import { storage } from '../../services/storage';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onSelectDatabase: (id: string) => void;
  onSelectCanvas: (id: string) => void;
  onSelectGraph: () => void;
  onCreatePage: () => void;
  onOpenSettings: () => void;
  onToggleAi: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectPage,
  onSelectDatabase,
  onSelectCanvas,
  onSelectGraph,
  onCreatePage,
  onOpenSettings,
  onToggleAi,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const pages = storage.getPages();
  const databases = storage.getDatabases();
  const canvases = storage.getCanvases();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Search items
  const matchedPages = pages.filter((p) => p.title.toLowerCase().includes(query.toLowerCase()));
  const matchedDatabases = databases.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));
  const matchedCanvases = canvases.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));

  const actions = [
    {
      id: 'act-new-page',
      title: 'New Note',
      category: 'Actions',
      icon: Plus,
      run: () => {
        onCreatePage();
        onClose();
      },
    },
    {
      id: 'act-graph',
      title: 'Open Knowledge Graph',
      category: 'Views',
      icon: Share2,
      run: () => {
        onSelectGraph();
        onClose();
      },
    },
    {
      id: 'act-ai',
      title: 'Toggle AI Assistant',
      category: 'Actions',
      icon: Sparkles,
      run: () => {
        onToggleAi();
        onClose();
      },
    },
    {
      id: 'act-settings',
      title: 'Workspace Settings & Keys',
      category: 'Actions',
      icon: Settings,
      run: () => {
        onOpenSettings();
        onClose();
      },
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4 select-none animate-fade-in text-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-[#1c1c1c] border border-[#e5e5e5] dark:border-[#333] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-[#e5e5e5] dark:border-[#2e2e2e] flex items-center space-x-3">
          <Search size={16} className="text-[#737373]" />
          <input
            type="text"
            autoFocus
            placeholder="Type a command or search documents, bases, or graph..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-black dark:text-white focus:outline-none placeholder:text-[#a3a3a3]"
          />
          <kbd className="font-mono text-[10px] bg-[#fafafa] dark:bg-[#282828] border border-[#e5e5e5] dark:border-[#333] px-1.5 py-0.5 rounded text-[#737373]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-3">
          {/* Actions */}
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373] px-3 py-1">
              Quick Actions
            </div>
            <div className="space-y-0.5">
              {actions.map((act) => {
                const Icon = act.icon;
                return (
                  <button
                    key={act.id}
                    onClick={act.run}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#fafafa] dark:hover:bg-[#262626] text-black dark:text-white transition-colors group"
                  >
                    <Icon size={14} className="text-[#737373] group-hover:text-black dark:group-hover:text-white" />
                    <span className="font-medium flex-1">{act.title}</span>
                    <ArrowRight size={12} className="text-[#a3a3a3] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matched Documents */}
          {matchedPages.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373] px-3 py-1">
                Documents ({matchedPages.length})
              </div>
              <div className="space-y-0.5">
                {matchedPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => {
                      onSelectPage(page.id);
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#fafafa] dark:hover:bg-[#262626] text-black dark:text-white transition-colors group"
                  >
                    <span>{page.icon || '📄'}</span>
                    <span className="font-medium flex-1 truncate">{page.title}</span>
                    <span className="text-[10px] text-[#a3a3a3] font-mono">
                      {page.tags?.map((t) => `#${t}`).join(' ')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Databases */}
          {matchedDatabases.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373] px-3 py-1">
                Collections ({matchedDatabases.length})
              </div>
              <div className="space-y-0.5">
                {matchedDatabases.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => {
                      onSelectDatabase(db.id);
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#fafafa] dark:hover:bg-[#262626] text-black dark:text-white transition-colors"
                  >
                    <span>{db.icon || '📊'}</span>
                    <span className="font-medium flex-1 truncate">{db.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Matched Canvases */}
          {matchedCanvases.length > 0 && (
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-[#737373] px-3 py-1">
                Whiteboards ({matchedCanvases.length})
              </div>
              <div className="space-y-0.5">
                {matchedCanvases.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectCanvas(c.id);
                      onClose();
                    }}
                    className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-left hover:bg-[#fafafa] dark:hover:bg-[#262626] text-black dark:text-white transition-colors"
                  >
                    <Layout size={13} className="text-[#737373]" />
                    <span className="font-medium flex-1 truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
