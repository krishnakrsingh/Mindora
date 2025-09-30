import React, { useState, useEffect } from 'react';
import { ViewMode, Page, Database, CanvasBoard, Workspace } from './types';
import { storage } from './services/storage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { BlockEditor } from './components/editor/BlockEditor';
import { BaseViewContainer } from './components/bases/BaseViewContainer';
import { KnowledgeGraphView } from './components/graph/KnowledgeGraphView';
import { VisualCanvasView } from './components/canvas/VisualCanvasView';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { CommandPalette } from './components/search/CommandPalette';
import { VaultImportModal } from './components/import/VaultImportModal';
import { SettingsModal } from './components/settings/SettingsModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';

export const App: React.FC = () => {
  // Reactive state derived from storage
  const [workspace, setWorkspace] = useState<Workspace>(storage.getActiveWorkspace());
  const [workspaces, setWorkspaces] = useState<Workspace[]>(storage.getWorkspaces());
  const [pages, setPages] = useState<Page[]>(storage.getPages());
  const [databases, setDatabases] = useState<Database[]>(storage.getDatabases());
  const [canvases, setCanvases] = useState<CanvasBoard[]>(storage.getCanvases());

  // Active view and navigation
  const [viewMode, setViewMode] = useState<ViewMode>('doc');
  const [activePageId, setActivePageId] = useState<string>(pages[0]?.id || '');
  const [activeDatabaseId, setActiveDatabaseId] = useState<string>(databases[0]?.id || '');
  const [activeCanvasId, setActiveCanvasId] = useState<string>(canvases[0]?.id || '');

  // UI Modals & Drawers
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Global keyboard shortcuts (Cmd+K for search, Cmd+/ for shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '/') {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = storage.subscribe(() => {
      setWorkspace(storage.getActiveWorkspace());
      setWorkspaces(storage.getWorkspaces());
      setPages(storage.getPages());
      setDatabases(storage.getDatabases());
      setCanvases(storage.getCanvases());
    });
    return () => unsubscribe();
  }, []);

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const activeDatabase = databases.find((d) => d.id === activeDatabaseId) || databases[0];
  const activeCanvas = canvases.find((c) => c.id === activeCanvasId) || canvases[0];

  // Navigation handlers
  const handleNavigateToPage = (titleOrId: string) => {
    const page = pages.find(
      (p) => p.id === titleOrId || p.title.toLowerCase() === titleOrId.toLowerCase().trim()
    );
    if (page) {
      setActivePageId(page.id);
      setViewMode('doc');
    }
  };

  const handleSelectPage = (id: string) => {
    setActivePageId(id);
    setViewMode('doc');
  };

  const handleSelectDatabase = (id: string) => {
    setActiveDatabaseId(id);
    setViewMode('base');
  };

  const handleSelectCanvas = (id: string) => {
    setActiveCanvasId(id);
    setViewMode('canvas');
  };

  const handleSelectGraph = () => {
    setViewMode('graph');
  };

  // Creation handlers
  const handleCreatePage = (parentId?: string | null) => {
    const newPage = storage.createPage('Untitled Note', '', parentId);
    setActivePageId(newPage.id);
    setViewMode('doc');
  };

  const handleCreateDatabase = () => {
    const newDb = storage.createDatabase('New Collection');
    setActiveDatabaseId(newDb.id);
    setViewMode('base');
  };

  const handleCreateCanvas = () => {
    const newCv = storage.createCanvas('New Whiteboard');
    setActiveCanvasId(newCv.id);
    setViewMode('canvas');
  };

  const handleDeletePage = (id: string) => {
    storage.deletePage(id);
    if (activePageId === id) {
      const remaining = pages.filter((p) => p.id !== id);
      if (remaining.length > 0) {
        setActivePageId(remaining[0].id);
      }
    }
  };

  const handleToggleFavorite = (id: string) => {
    const p = pages.find((page) => page.id === id);
    if (p) {
      storage.updatePage(id, { isFavorite: !p.isFavorite });
    }
  };

  const handleSwitchWorkspace = (id: string) => {
    storage.setActiveWorkspace(id);
    const newPages = storage.getPages();
    if (newPages.length > 0) setActivePageId(newPages[0].id);
  };

  const handleCreateWorkspace = () => {
    const name = prompt('Enter new workspace name:');
    if (name && name.trim()) {
      storage.createWorkspace(name.trim());
    }
  };

  return (
    <div className={`w-screen h-screen flex flex-col overflow-hidden bg-[#0e0f12] text-slate-100 ${darkMode ? 'dark' : ''}`}>
      {/* Universal Top Header */}
      <Header
        viewMode={viewMode}
        setViewMode={setViewMode}
        activePage={activePage}
        activeDatabase={activeDatabase}
        activeCanvas={activeCanvas}
        isAiOpen={isAiOpen}
        setIsAiOpen={setIsAiOpen}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentWorkspace={workspace}
          workspaces={workspaces}
          pages={pages}
          databases={databases}
          canvases={canvases}
          activePageId={activePageId}
          activeDatabaseId={activeDatabaseId}
          activeCanvasId={activeCanvasId}
          viewMode={viewMode}
          onSelectPage={handleSelectPage}
          onSelectDatabase={handleSelectDatabase}
          onSelectCanvas={handleSelectCanvas}
          onSelectGraph={handleSelectGraph}
          onCreatePage={handleCreatePage}
          onCreateDatabase={handleCreateDatabase}
          onCreateCanvas={handleCreateCanvas}
          onDeletePage={handleDeletePage}
          onToggleFavorite={handleToggleFavorite}
          onSwitchWorkspace={handleSwitchWorkspace}
          onCreateWorkspace={handleCreateWorkspace}
        />

        {/* Central Workspace Canvas / Editor / Base / Graph */}
        <main className="flex-1 flex overflow-hidden relative">
          {viewMode === 'doc' && activePage && (
            <BlockEditor
              key={activePage.id}
              page={activePage}
              onUpdatePage={(updates) => storage.updatePage(activePage.id, updates)}
              onNavigateToPage={handleNavigateToPage}
              onRequestAiInline={(action, text) => {
                setIsAiOpen(true);
              }}
            />
          )}

          {viewMode === 'base' && activeDatabase && (
            <BaseViewContainer
              key={activeDatabase.id}
              database={activeDatabase}
              records={storage.getRecords(activeDatabase.id)}
              onUpdateDatabase={(updates) => storage.updateDatabase(activeDatabase.id, updates)}
              onNavigateToPage={handleNavigateToPage}
            />
          )}

          {viewMode === 'graph' && (
            <KnowledgeGraphView
              activePageId={activePageId}
              onNavigateToPage={handleNavigateToPage}
            />
          )}

          {viewMode === 'canvas' && activeCanvas && (
            <VisualCanvasView
              key={activeCanvas.id}
              canvas={activeCanvas}
              onUpdateCanvas={(updates) => storage.updateCanvas(activeCanvas.id, updates)}
              onNavigateToPage={handleNavigateToPage}
            />
          )}

          {/* Contextual AI Assistant Panel Drawer */}
          <AIAssistantPanel
            isOpen={isAiOpen}
            onClose={() => setIsAiOpen(false)}
            activePage={activePage}
            onNavigateToPage={handleNavigateToPage}
            onApplyDiff={(proposedText) => {
              if (activePage) {
                storage.updatePage(activePage.id, { content: proposedText });
              }
            }}
          />
        </main>
      </div>

      {/* Global Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={handleSelectPage}
        onSelectDatabase={handleSelectDatabase}
        onSelectCanvas={handleSelectCanvas}
        onSelectGraph={handleSelectGraph}
        onCreatePage={() => handleCreatePage(null)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleAi={() => setIsAiOpen(!isAiOpen)}
      />

      {/* Obsidian Vault Import & Full Export Modal */}
      <VaultImportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onRefreshWorkspace={() => {
          setPages(storage.getPages());
        }}
      />

      {/* Settings & AI Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Keyboard Shortcuts Cheat Sheet (Cmd+/) */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
};

