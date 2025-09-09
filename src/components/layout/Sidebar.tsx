import React, { useState } from 'react';
import { 
  FileText, 
  Database, 
  Share2, 
  Layout, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Star, 
  Trash2, 
  FolderPlus, 
  Tag, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Page, Database as DatabaseType, CanvasBoard, ViewMode, Workspace } from '../../types';
import { storage } from '../../services/storage';

interface SidebarProps {
  currentWorkspace: Workspace;
  workspaces: Workspace[];
  pages: Page[];
  databases: DatabaseType[];
  canvases: CanvasBoard[];
  activePageId?: string;
  activeDatabaseId?: string;
  activeCanvasId?: string;
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
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const favorites = pages.filter((p) => p.isFavorite);
  const rootPages = pages.filter((p) => !p.parentId);

  // Group tags
  const tagsMap = new Map<string, number>();
  for (const page of pages) {
    for (const tag of page.tags) {
      tagsMap.set(tag, (tagsMap.get(tag) || 0) + 1);
    }
  }

  const renderPageItem = (page: Page, level = 0) => {
    const children = pages.filter((p) => p.parentId === page.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedParents[page.id] ?? true;
    const isSelected = viewMode === 'doc' && activePageId === page.id;

    return (
      <div key={page.id} className="group/item">
        <div
          onClick={() => onSelectPage(page.id)}
          className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs cursor-pointer transition-all ${
            isSelected
              ? 'bg-indigo-600/20 text-indigo-300 font-medium'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
        >
          <div className="flex items-center space-x-1.5 truncate">
            {hasChildren ? (
              <button
                onClick={(e) => toggleExpand(page.id, e)}
                className="p-0.5 hover:text-white"
              >
                {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
            ) : (
              <span className="w-3" />
            )}
            <span>{page.icon || '📄'}</span>
            <span className="truncate">{page.title || 'Untitled'}</span>
          </div>

          <div className="hidden group-hover/item:flex items-center space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreatePage(page.id);
              }}
              title="Add sub-page"
              className="p-1 hover:text-indigo-400"
            >
              <Plus size={11} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(page.id);
              }}
              title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1 ${page.isFavorite ? 'text-amber-400' : 'hover:text-amber-400'}`}
            >
              <Star size={11} fill={page.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage(page.id);
              }}
              title="Delete note"
              className="p-1 hover:text-rose-400"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>{children.map((child) => renderPageItem(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 h-full border-r border-white/5 bg-[#121318] flex flex-col select-none text-xs z-20">
      {/* Workspace Header Dropdown */}
      <div className="p-3 border-b border-white/5 relative">
        <div
          onClick={() => setWorkspaceDropdownOpen(!workspaceDropdownOpen)}
          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white/5 cursor-pointer text-slate-200 transition-colors"
        >
          <div className="flex items-center space-x-2 truncate">
            <span className="text-base">{currentWorkspace.icon || '🧠'}</span>
            <span className="font-semibold truncate">{currentWorkspace.name}</span>
          </div>
          <ChevronDown size={14} className="text-slate-400" />
        </div>

        {workspaceDropdownOpen && (
          <div className="absolute top-12 left-3 right-3 bg-[#1e2029] border border-white/10 rounded-lg shadow-2xl p-1 z-50 animate-fade-in">
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
              Workspaces
            </div>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  onSwitchWorkspace(ws.id);
                  setWorkspaceDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left transition-colors ${
                  ws.id === currentWorkspace.id
                    ? 'bg-indigo-600 text-white font-medium'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                <span className="flex items-center space-x-2 truncate">
                  <span>{ws.icon || '📁'}</span>
                  <span className="truncate">{ws.name}</span>
                </span>
                {ws.id === currentWorkspace.id && <CheckCircle2 size={12} />}
              </button>
            ))}
            <div className="border-t border-white/5 mt-1 pt-1">
              <button
                onClick={() => {
                  onCreateWorkspace();
                  setWorkspaceDropdownOpen(false);
                }}
                className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <FolderPlus size={13} />
                <span>New Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {/* Favorites Section */}
        {favorites.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center space-x-1">
              <Star size={11} className="text-amber-400" />
              <span>Favorites</span>
            </div>
            <div className="space-y-0.5 mt-1">
              {favorites.map((p) => (
                <div
                  key={`fav-${p.id}`}
                  onClick={() => onSelectPage(p.id)}
                  className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                    viewMode === 'doc' && activePageId === p.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <span>{p.icon || '📄'}</span>
                  <span className="truncate">{p.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents Section */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            <span className="flex items-center space-x-1">
              <FileText size={11} />
              <span>Documents ({pages.length})</span>
            </span>
            <button
              onClick={() => onCreatePage(null)}
              className="p-1 hover:text-slate-200 hover:bg-white/5 rounded transition-colors"
              title="Create new note"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {rootPages.map((page) => renderPageItem(page))}
          </div>
        </div>

        {/* Databases Section */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            <span className="flex items-center space-x-1">
              <Database size={11} />
              <span>Bases ({databases.length})</span>
            </span>
            <button
              onClick={onCreateDatabase}
              className="p-1 hover:text-slate-200 hover:bg-white/5 rounded transition-colors"
              title="Create new database"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {databases.map((db) => (
              <div
                key={db.id}
                onClick={() => onSelectDatabase(db.id)}
                className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                  viewMode === 'base' && activeDatabaseId === db.id
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{db.icon || '📊'}</span>
                <span className="truncate">{db.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Canvases Section */}
        <div>
          <div className="px-2 py-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500 font-bold">
            <span className="flex items-center space-x-1">
              <Layout size={11} />
              <span>Canvases ({canvases.length})</span>
            </span>
            <button
              onClick={onCreateCanvas}
              className="p-1 hover:text-slate-200 hover:bg-white/5 rounded transition-colors"
              title="Create new whiteboard canvas"
            >
              <Plus size={13} />
            </button>
          </div>
          <div className="space-y-0.5 mt-1">
            {canvases.map((cv) => (
              <div
                key={cv.id}
                onClick={() => onSelectCanvas(cv.id)}
                className={`flex items-center space-x-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-all ${
                  viewMode === 'canvas' && activeCanvasId === cv.id
                    ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>🗺️</span>
                <span className="truncate">{cv.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Knowledge Graph Direct Action */}
        <div>
          <div
            onClick={onSelectGraph}
            className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-md cursor-pointer transition-all ${
              viewMode === 'graph'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Share2 size={13} className="text-indigo-400" />
            <span className="font-medium">Knowledge Graph</span>
          </div>
        </div>

        {/* Workspace Tags */}
        {tagsMap.size > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center space-x-1">
              <Tag size={11} />
              <span>Tags ({tagsMap.size})</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1 px-1">
              {Array.from(tagsMap.entries()).map(([tag, count]) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded bg-white/5 text-slate-400 hover:text-slate-200 text-[10px] cursor-pointer"
                >
                  #{tag} <span className="opacity-60">({count})</span>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center space-x-1 text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Local-first active</span>
        </span>
        <span>v1.0.0</span>
      </div>
    </aside>
  );
};

