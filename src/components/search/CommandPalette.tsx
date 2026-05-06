import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  FileText, 
  Database, 
  Share2, 
  Layout, 
  Sparkles, 
  Plus, 
  Settings, 
  X,
  Command
} from 'lucide-react';
import { Page, Database as DatabaseType, CanvasBoard } from '../../types';
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
  const inputRef = useRef<HTMLInputElement>(null);

  const pages = storage.getPages();
  const databases = storage.getDatabases();
  const canvases = storage.getCanvases();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global keyboard shortcut Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered by parent
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Filter items
  const filteredPages = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.content.toLowerCase().includes(query.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
  );

  const filteredDatabases = databases.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredCanvases = canvases.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  interface PaletteItem {
    id: string;
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    category: 'Pages' | 'Databases' | 'Canvases' | 'Actions';
    action: () => void;
  }

  const items: PaletteItem[] = [
    // Actions
    {
      id: 'act-new-page',
      title: 'Create New Note',
      icon: <Plus size={14} className="text-emerald-400" />,
      category: 'Actions',
      action: () => {
        onCreatePage();
        onClose();
      },
    },
    {
      id: 'act-open-graph',
      title: 'Open Knowledge Graph',
      icon: <Share2 size={14} className="text-indigo-400" />,
      category: 'Actions',
      action: () => {
        onSelectGraph();
        onClose();
      },
    },
    {
      id: 'act-open-ai',
      title: 'Open Mindora AI Assistant',
      icon: <Sparkles size={14} className="text-purple-400" />,
      category: 'Actions',
      action: () => {
        onToggleAi();
        onClose();
      },
    },
    {
      id: 'act-open-settings',
      title: 'Workspace Settings & AI Keys',
      icon: <Settings size={14} className="text-slate-400" />,
      category: 'Actions',
      action: () => {
        onOpenSettings();
        onClose();
      },
    },
    // Pages
    ...filteredPages.map((p) => ({
      id: p.id,
      title: p.title,
      subtitle: p.tags.length > 0 ? `#${p.tags.join(' #')}` : p.content.slice(0, 60),
      icon: <FileText size={14} className="text-indigo-400" />,
      category: 'Pages' as const,
      action: () => {
        onSelectPage(p.id);
        onClose();
      },
    })),
    // Databases
    ...filteredDatabases.map((d) => ({
      id: d.id,
      title: d.title,
      subtitle: 'Relational Database',
      icon: <Database size={14} className="text-emerald-400" />,
      category: 'Databases' as const,
      action: () => {
        onSelectDatabase(d.id);
        onClose();
      },
    })),
    // Canvases
    ...filteredCanvases.map((c) => ({
      id: c.id,
      title: c.title,
      subtitle: 'Visual Canvas',
      icon: <Layout size={14} className="text-purple-400" />,
      category: 'Canvases' as const,
      action: () => {
        onSelectCanvas(c.id);
        onClose();
      },
    })),
  ];

  // Key navigation
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, items.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + items.length) % Math.max(1, items.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].action();
      }
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 select-none animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-[#161822] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-xs"
      >
        {/* Search Input Box */}
        <div className="p-3.5 border-b border-white/10 flex items-center space-x-3 bg-white/[0.02]">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search documents..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDownList}
            className="w-full bg-transparent border-none text-slate-100 placeholder:text-slate-500 focus:outline-none text-sm"
          />
          <kbd className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-slate-400 border border-white/10">ESC</kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {items.length === 0 ? (
            <div className="p-8 text-center text-slate-500 italic">No matching results found</div>
          ) : (
            items.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-600 text-white' : 'hover:bg-white/5 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <span className="p-1 rounded-lg bg-black/20 shrink-0">{item.icon}</span>
                    <div className="truncate">
                      <div className="font-semibold text-xs truncate">{item.title}</div>
                      {item.subtitle && (
                        <div
                          className={`text-[10px] truncate ${
                            isSelected ? 'text-indigo-200' : 'text-slate-500'
                          }`}
                        >
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

