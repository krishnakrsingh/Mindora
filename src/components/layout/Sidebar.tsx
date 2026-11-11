import React, { useState } from 'react';
import { 
  FileText, 
  Database as DatabaseIcon, 
  Share2, 
  Layout, 
  Plus, 
  Star, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  Hash, 
  Search,
  Command,
  HelpCircle,
  FolderPlus,
  ShieldCheck
} from 'lucide-react';
import { Page, Database, CanvasBoard, Workspace, ViewMode } from '../../types';

interface SidebarProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  pages: Page[];
  databases: Database[];
  canvases: CanvasBoard[];
  activePageId: string;
  activeDatabaseId: string;
  activeCanvasId: string;
  viewMode: ViewMode;
  onSelectPage: (id: string) => void;
  onSelectDatabase: (id: string) => void;
  onSelectCanvas: (id: string) => void;
  onSelectGraph: () => void;
  onCreatePage: (parentId?: string | null) => void;
  onCreateDatabase: () => void;
  onCreateCanvas: () => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentWorkspace,
  workspaces,
  pages,
  databases,
  canvases,
  activePageId,
  activeDatabaseId,
  activeCanvasId,
  viewMode,
  onSelectPage,
  onSelectDatabase,
  onSelectCanvas,
  onSelectGraph,
  onCreatePage,
  onCreateDatabase,
  onCreateCanvas,
  onDeletePage,
  onToggleFavorite,
  onSwitchWorkspace,
  onCreateWorkspace,
}) => {
  const [collapsedSections, setCollapsedSections] = useState({
    favorites: false,
    docs: false,
    bases: false,
    canvas: false,
    tags: false,
  });
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const favoritePages = pages.filter((p) => p.isFavorite);
  const rootPages = pages.filter((p) => !p.parentId);

  // Extract all unique tags across pages
  const allTags = Array.from(
    new Set(pages.flatMap((p) => p.tags || []))
  ).filter(Boolean);

  return (
    <aside className="w-64 border-r border-[#e5e5e5] dark:border-[#262626] bg-[#fafafa] dark:bg-[#1a1a1a] flex flex-col h-full select-none text-xs transition-colors">
      {/* Workspace Selector Bar */}
      <div className="p-3 border-b border-[#e5e5e5] dark:border-[#262626] relative">
        <button
          onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
          className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white dark:hover:bg-[#242424] border border-transparent hover:border-[#e5e5e5] dark:hover:border-[#333] transition-all text-left"
        >
          <div className="flex items-center space-x-2.5 truncate">
            <span className="text-base">{currentWorkspace?.icon || '🧠'}</span>
            <div className="truncate">
              <div className="font-heading font-semibold text-black dark:text-white truncate">
                {currentWorkspace?.name || 'My Workspace'}
              </div>
              <div className="text-[10px] text-[#737373] dark:text-[#a3a3a3] truncate">
                {pages.length} docs · {databases.length} bases
              </div>
            </div>
          </div>
          <ChevronDown size={14} className="text-[#737373] dark:text-[#a3a3a3] flex-shrink-0" />
        </button>

        {/* Workspace Dropdown */}
        {isWorkspaceMenuOpen && (
          <div className="absolute top-full left-3 right-3 mt-1 bg-white dark:bg-[#222222] border border-[#e5e5e5] dark:border-[#333] rounded-xl shadow-lg p-1.5 z-40 animate-fade-in">
            <div className="text-[10px] uppercase font-mono tracking-wider text-[#737373] dark:text-[#a3a3a3] px-2 py-1">
              Workspaces
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  onSwitchWorkspace(ws.id);
                  setIsWorkspaceMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left transition-colors ${
                  ws.id === currentWorkspace?.id
                    ? 'bg-black text-white dark:bg-white dark:text-black font-medium'
                    : 'text-black dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a]'
                }`}
              >
                <span>{ws.icon || '📁'}</span>
                <span className="truncate flex-1">{ws.name}</span>
              </button>
            ))}
            <div className="border-t border-[#e5e5e5] dark:border-[#333] my-1" />
            <button
              onClick={() => {
                onCreateWorkspace();
                setIsWorkspaceMenuOpen(false);
              }}
              className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-lg text-left text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition-colors"
            >
              <FolderPlus size={13} />
              <span>New Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Navigation Trees */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {/* Knowledge Graph Quick Entry */}
        <div>
          <button
            onClick={onSelectGraph}
            className={`w-full flex items-center space-x-2.5 px-2.5 py-1.5 rounded-full transition-all ${
              viewMode === 'graph'
                ? 'bg-black text-white dark:bg-white dark:text-black font-medium shadow-sm'
                : 'text-black dark:text-white hover:bg-white dark:hover:bg-[#242424]'
            }`}
          >
            <Share2 size={14} className={viewMode === 'graph' ? 'text-white dark:text-black' : 'text-[#737373] dark:text-[#a3a3a3]'} />
            <span className="font-medium">Knowledge Graph</span>
          </button>
        </div>

        {/* Favorites Section */}
        {favoritePages.length > 0 && (
          <div>
            <div 
              onClick={() => toggleSection('favorites')}
              className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3] cursor-pointer hover:text-black dark:hover:text-white"
            >
              <div className="flex items-center space-x-1.5">
                <Star size={11} className="fill-amber-400 text-amber-400" />
                <span>FAVORITES</span>
              </div>
              {collapsedSections.favorites ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
            </div>

            {!collapsedSections.favorites && (
              <div className="mt-1 space-y-0.5">
                {favoritePages.map((p) => (
                  <div
                    key={`fav-${p.id}`}
                    onClick={() => onSelectPage(p.id)}
                    className={`group flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      viewMode === 'doc' && activePageId === p.id
                        ? 'bg-white dark:bg-[#242424] text-black dark:text-white font-medium border border-[#e5e5e5] dark:border-[#333]'
                        : 'text-[#525252] dark:text-[#d4d4d4] hover:bg-white dark:hover:bg-[#242424]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{p.icon || '📄'}</span>
                      <span className="truncate">{p.title || 'Untitled Note'}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(p.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-amber-400 hover:text-amber-500"
                    >
                      <Star size={11} className="fill-current" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
            <div 
              onClick={() => toggleSection('docs')}
              className="flex items-center space-x-1 cursor-pointer hover:text-black dark:hover:text-white"
            >
              {collapsedSections.docs ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>DOCUMENTS</span>
              <span className="font-mono text-[10px] text-[#a3a3a3] ml-1">({pages.length})</span>
            </div>
            <button
              onClick={() => onCreatePage(null)}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-[#242424] text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
              title="New Document"
            >
              <Plus size={13} />
            </button>
          </div>

          {!collapsedSections.docs && (
            <div className="mt-1 space-y-0.5">
              {rootPages.map((p) => {
                const isActive = viewMode === 'doc' && activePageId === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectPage(p.id)}
                    className={`group flex items-center justify-between px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-[#242424] text-black dark:text-white font-medium border border-[#e5e5e5] dark:border-[#333]'
                        : 'text-[#525252] dark:text-[#d4d4d4] hover:bg-white dark:hover:bg-[#242424]'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span>{p.icon || '📄'}</span>
                      <span className="truncate">{p.title || 'Untitled Note'}</span>
                    </div>

                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(p.id);
                        }}
                        className={`p-0.5 hover:text-amber-500 ${p.isFavorite ? 'text-amber-400' : 'text-[#a3a3a3]'}`}
                        title="Favorite"
                      >
                        <Star size={11} className={p.isFavorite ? 'fill-current' : ''} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${p.title}"?`)) onDeletePage(p.id);
                        }}
                        className="p-0.5 text-[#a3a3a3] hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bases / Databases Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
            <div 
              onClick={() => toggleSection('bases')}
              className="flex items-center space-x-1 cursor-pointer hover:text-black dark:hover:text-white"
            >
              {collapsedSections.bases ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>COLLECTIONS</span>
              <span className="font-mono text-[10px] text-[#a3a3a3] ml-1">({databases.length})</span>
            </div>
            <button
              onClick={onCreateDatabase}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-[#242424] text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
              title="New Collection Base"
            >
              <Plus size={13} />
            </button>
          </div>

          {!collapsedSections.bases && (
            <div className="mt-1 space-y-0.5">
              {databases.map((db) => {
                const isActive = viewMode === 'base' && activeDatabaseId === db.id;
                return (
                  <div
                    key={db.id}
                    onClick={() => onSelectDatabase(db.id)}
                    className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-[#242424] text-black dark:text-white font-medium border border-[#e5e5e5] dark:border-[#333]'
                        : 'text-[#525252] dark:text-[#d4d4d4] hover:bg-white dark:hover:bg-[#242424]'
                    }`}
                  >
                    <span>{db.icon || '📊'}</span>
                    <span className="truncate flex-1">{db.title || 'Untitled Base'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Canvas / Whiteboards Section */}
        <div>
          <div className="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3]">
            <div 
              onClick={() => toggleSection('canvas')}
              className="flex items-center space-x-1 cursor-pointer hover:text-black dark:hover:text-white"
            >
              {collapsedSections.canvas ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>WHITEBOARDS</span>
              <span className="font-mono text-[10px] text-[#a3a3a3] ml-1">({canvases.length})</span>
            </div>
            <button
              onClick={onCreateCanvas}
              className="p-1 rounded-full hover:bg-white dark:hover:bg-[#242424] text-[#737373] dark:text-[#a3a3a3] hover:text-black dark:hover:text-white"
              title="New Canvas"
            >
              <Plus size={13} />
            </button>
          </div>

          {!collapsedSections.canvas && (
            <div className="mt-1 space-y-0.5">
              {canvases.map((c) => {
                const isActive = viewMode === 'canvas' && activeCanvasId === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => onSelectCanvas(c.id)}
                    className={`flex items-center space-x-2 px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-white dark:bg-[#242424] text-black dark:text-white font-medium border border-[#e5e5e5] dark:border-[#333]'
                        : 'text-[#525252] dark:text-[#d4d4d4] hover:bg-white dark:hover:bg-[#242424]'
                    }`}
                  >
                    <Layout size={13} className="text-[#737373]" />
                    <span className="truncate flex-1">{c.title || 'Untitled Canvas'}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div 
              onClick={() => toggleSection('tags')}
              className="flex items-center space-x-1 px-2 py-1 text-[11px] font-semibold text-[#737373] dark:text-[#a3a3a3] cursor-pointer hover:text-black dark:hover:text-white"
            >
              {collapsedSections.tags ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              <span>TAGS</span>
            </div>

            {!collapsedSections.tags && (
              <div className="mt-1 flex flex-wrap gap-1 px-1">
                {allTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] bg-white dark:bg-[#242424] border border-[#e5e5e5] dark:border-[#333] text-[#525252] dark:text-[#a3a3a3]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Sidebar Footer with Zero-Leak Local Status Indicator */}
      <div className="p-3 border-t border-[#e5e5e5] dark:border-[#262626] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#737373] dark:text-[#a3a3a3]">
          <div className="flex items-center space-x-1.5" title="Zero-leak client-side knowledge engine">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span className="font-medium text-black dark:text-white">Zero-Leak Local</span>
          </div>
          <span className="font-mono text-[10px]">Ollama / Offline</span>
        </div>
      </div>
    </aside>
  );
};
