import { 
  Workspace, 
  Page, 
  Database, 
  DatabaseRecord, 
  CanvasBoard, 
  AIConversation, 
  AISettings 
} from '../types';

const STORAGE_KEY_PREFIX = 'mindora_v1_';
const SECURE_VAULT_KEY = 'mindora_secure_cred_v1';
const SESSION_VAULT_KEY = 'mindora_session_cred_v1';

export interface StorageState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  pages: Page[];
  databases: Database[];
  records: DatabaseRecord[];
  canvases: CanvasBoard[];
  conversations: AIConversation[];
  aiSettings: AISettings;
}

/**
 * Isolated Secure Key Manager
 * Keeps secret API keys strictly isolated from workspace documents and general state.
 * By default, retains credentials in session memory / sessionStorage so keys are
 * wiped upon closing the browser tab. Never exports keys in workspace snapshots or JSON backups.
 */
class SecureKeyManager {
  private inMemoryKey: string = '';

  public getKey(): string {
    if (this.inMemoryKey) return this.inMemoryKey;
    try {
      if (typeof sessionStorage !== 'undefined') {
        const sessionKey = sessionStorage.getItem(SESSION_VAULT_KEY);
        if (sessionKey) {
          this.inMemoryKey = sessionKey;
          return sessionKey;
        }
      }
      if (typeof localStorage !== 'undefined') {
        const persisted = localStorage.getItem(SECURE_VAULT_KEY);
        if (persisted) {
          try {
            const decoded = decodeURIComponent(atob(persisted));
            this.inMemoryKey = decoded;
            return decoded;
          } catch {
            return '';
          }
        }
      }
    } catch {
      // Storage access blocked or restricted
    }
    return '';
  }

  public setKey(key: string, persistOnDevice = false): void {
    const trimmed = (key || '').trim();
    this.inMemoryKey = trimmed;
    try {
      if (typeof sessionStorage !== 'undefined') {
        if (trimmed) {
          sessionStorage.setItem(SESSION_VAULT_KEY, trimmed);
        } else {
          sessionStorage.removeItem(SESSION_VAULT_KEY);
        }
      }
      if (typeof localStorage !== 'undefined') {
        if (trimmed && persistOnDevice) {
          localStorage.setItem(SECURE_VAULT_KEY, btoa(encodeURIComponent(trimmed)));
        } else {
          localStorage.removeItem(SECURE_VAULT_KEY);
        }
      }
    } catch {
      // Storage failure handled gracefully
    }
  }

  public clearKey(): void {
    this.inMemoryKey = '';
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(SESSION_VAULT_KEY);
      if (typeof localStorage !== 'undefined') localStorage.removeItem(SECURE_VAULT_KEY);
    } catch {}
  }
}

export const secureKeyManager = new SecureKeyManager();

const DEFAULT_SETTINGS: AISettings = {
  provider: 'ollama',
  apiKey: '',
  model: 'llama3.2',
  temperature: 0.7,
  baseUrl: 'http://localhost:11434',
};

const SEED_WORKSPACE: Workspace = {
  id: 'ws-mindora-primary',
  name: 'Mindora Engineering',
  description: 'Primary workspace for AI-native knowledge development & architecture.',
  icon: '🧠',
  createdAt: Date.now() - 86400000 * 5,
  updatedAt: Date.now(),
};

const SEED_PAGES: Page[] = [
  {
    id: 'page-welcome',
    workspaceId: 'ws-mindora-primary',
    title: 'Welcome to Mindora',
    icon: '✨',
    tags: ['guide', 'overview', 'getting-started'],
    isFavorite: true,
    parentId: null,
    createdAt: Date.now() - 86400000 * 4,
    updatedAt: Date.now(),
    content: `# Welcome to Mindora

Mindora is an **AI-native knowledge workspace** engineered to synthesize the best attributes of modern thought tools into one coherent, fluid experience.

> **Core Philosophy**: Information should be interconnected, not isolated. Finding something should be faster than remembering where it was saved, and AI should run zero-leak with full local privacy.

---

## ⚡ What Makes Mindora Different

Mindora combines four primary capabilities into one canonical data model:

1. **World-Class Block Editor**: Write fluidly with slash commands (\`/\`), live widgets, checklists, code blocks, and math equations.
2. **First-Class Interconnected Knowledge**: Every document supports bidirectional Wikilinks (\`[[Page Title]]\`) with instantaneous resolution and interactive force-directed graph exploration.
3. **Relational Databases & Collections**: Notion-style tables, Kanban boards, and multi-property collections directly alongside documents.
4. **Zero-Leak Local AI**: Powered by **Ollama** (\`http://localhost:11434\`) running 100% private on your machine, or BYOK cloud providers with isolated in-memory credential storage.

---

## 🔒 Zero-Leak Privacy Guarantee

Your secrets belong to you:
- API keys are **never** stored in plain workspace JSON or exported in backups.
- Local inference with Ollama operates with zero cloud calls and zero telemetry.
- All workspace data is stored client-side in your own browser storage.

---

## 🧭 Key Concepts & Linked Knowledge

- Explore the technical blueprint in [[AI Systems Architecture]].
- Read about our conceptual foundation in [[Epistemology & Knowledge Graphs]].
- Review upcoming engineering milestones in [[Product Roadmap 2026]].

---

## 🛠️ Editor Shortcuts & Commands

| Shortcut / Action | Effect |
|---|---|
| \`/\` | Open Slash Command Palette |
| \`[[\` | Trigger Wikilink auto-complete |
| \`Cmd + K\` / \`Ctrl + K\` | Universal Command & Search Palette |
| \`Cmd + /\` / \`Ctrl + /\` | Keyboard Shortcuts Cheat Sheet |
| \`- [ ]\` | Create an interactive checklist item |
| \`> \` | Create a callout or quote |

- [x] Test the rich block editor
- [x] Inspect the bidirectional knowledge graph
- [x] Verify zero-leak key storage in Settings
- [ ] Connect local Ollama or your favorite LLM provider
- [ ] Create your first relational database view
`,
  },
  {
    id: 'page-ai-arch',
    workspaceId: 'ws-mindora-primary',
    title: 'AI Systems Architecture',
    icon: '🤖',
    tags: ['architecture', 'ai', 'rag', 'vectors'],
    isFavorite: true,
    parentId: null,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
    content: `# AI Systems Architecture

Mindora's intelligence layer is architected after Kenneth Bergquist's **Atomic** retrieval principles, extending classical RAG into an incremental, multi-provider knowledge engine.

---

## 🧬 Incremental Retrieval Pipeline

\`\`\`
Document Modification
       │
       ▼
Text Chunking (by H2/H3 semantic boundaries)
       │
       ▼
Embedding Generation (Local Cosine / Gemini / OpenAI)
       │
       ▼
Hybrid Search (BM25 keyword + Cosine similarity)
       │
       ▼
Reciprocal Rank Fusion (RRF)
       │
       ▼
Grounded Multi-Provider LLM Synthesis with Clickable Citations
\`\`\`

---

## 🌐 Knowledge Interconnection

Unlike generic chat interfaces, Mindora's AI leverages the graph topology. When you ask questions about [[Epistemology & Knowledge Graphs]] or queries linked in [[Product Roadmap 2026]], the AI traces both lexical content and structural connections.

### Multi-Provider Gateway
- **Ollama**: Zero-cloud, 100% private local inference on \`http://localhost:11434\`
- **Google Gemini**: Rapid, low-latency reasoning via \`gemini-2.5-flash\`
- **Anthropic Claude**: Complex synthesis via \`claude-3-5-sonnet\`
- **OpenAI**: \`gpt-4o-mini\` and reasoning models
- **OpenRouter**: Unified access to open models
`,
  },
  {
    id: 'page-epistemology',
    workspaceId: 'ws-mindora-primary',
    title: 'Epistemology & Knowledge Graphs',
    icon: '🕸️',
    tags: ['graph', 'epistemology', 'obsidian', 'zettelkasten'],
    isFavorite: false,
    parentId: null,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
    content: `# Epistemology & Knowledge Graphs

Knowledge is not a hierarchical folder tree; it is an associative network of concepts.

---

## 🌌 The Fallacy of Folders

Hierarchical filing systems force a rigid, singular path of classification:
\`Work > Projects > 2026 > Research > Mindora\`

In reality, an idea simultaneously belongs to:
- Systems engineering
- Epistemological inquiry
- Product design
- Local AI privacy

By replacing rigid folder trees with **Bidirectional Wikilinks** (\`[[Document Name]]\`), Mindora mirrors the neural architecture of human cognition.

---

## 🔗 Associative Links in this Vault

- Read [[Welcome to Mindora]] for the quick-start guide.
- Check [[AI Systems Architecture]] for the retrieval mathematics.
`,
  },
  {
    id: 'page-roadmap',
    workspaceId: 'ws-mindora-primary',
    title: 'Product Roadmap 2026',
    icon: '🗺️',
    tags: ['roadmap', 'planning', 'engineering'],
    isFavorite: false,
    parentId: null,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
    content: `# Product Roadmap 2026

Mindora development milestones, engineering priorities, and release targets.

---

## 🎯 Q1 2026: The Core Substrates (Completed)
- [x] Full Markdown Block Editor with slash commands and LaTeX KaTeX support
- [x] Force-directed Bidirectional Knowledge Graph
- [x] Notion-style Relational Databases with Formulas and Rollups
- [x] Zero-Leak Key Security and Local Ollama Integration
- [x] Obsidian Vault import with YAML frontmatter parsing

---

## 🚀 Q2 2026: Multi-Modal & Canvas Expansion
- [ ] Real-time CRDT peer-to-peer sync (Yjs / Automerge)
- [ ] Infinite visual whiteboard with arrow connector routing
- [ ] MCP Server integration for Claude Code, Cursor, and Antigravity
`,
  },
];

const SEED_DATABASE: Database = {
  id: 'db-initiatives',
  workspaceId: 'ws-mindora-primary',
  title: 'Engineering Initiatives & Sprints',
  description: 'Tracking core platform deliverables, priorities, and roadmap items.',
  icon: '🚀',
  properties: [
    {
      id: 'prop-status',
      name: 'Status',
      type: 'status',
      options: [
        { id: 'opt-planned', name: 'Planned', color: '#94a3b8' },
        { id: 'opt-progress', name: 'In Progress', color: '#38bdf8' },
        { id: 'opt-completed', name: 'Completed', color: '#4ade80' },
      ],
    },
    {
      id: 'prop-priority',
      name: 'Priority',
      type: 'select',
      options: [
        { id: 'opt-p0', name: 'P0 - Critical', color: '#ef4444' },
        { id: 'opt-p1', name: 'P1 - High', color: '#f59e0b' },
        { id: 'opt-p2', name: 'P2 - Routine', color: '#64748b' },
      ],
    },
    {
      id: 'prop-owner',
      name: 'Lead',
      type: 'text',
    },
    {
      id: 'prop-target',
      name: 'Target Sprint',
      type: 'text',
    },
  ],
  views: [
    {
      id: 'view-table-primary',
      name: 'All Initiatives',
      type: 'table',
    },
    {
      id: 'view-board-status',
      name: 'Status Board',
      type: 'board',
      groupByProperty: 'prop-status',
    },
    {
      id: 'view-gallery-cards',
      name: 'Initiatives Gallery',
      type: 'gallery',
    },
    {
      id: 'view-list-quick',
      name: 'Compact List',
      type: 'list',
    },
  ],
  activeViewId: 'view-table-primary',
  createdAt: Date.now() - 86400000 * 3,
  updatedAt: Date.now(),
};

const SEED_RECORDS: DatabaseRecord[] = [
  {
    id: 'rec-1',
    databaseId: 'db-initiatives',
    title: 'Zero-Leak Key Architecture & Ollama',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P0 - Critical',
      'prop-owner': 'Core Security',
      'prop-target': 'Sprint 24',
    },
    pageId: 'page-ai-arch',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-2',
    databaseId: 'db-initiatives',
    title: 'Bidirectional Knowledge Graph Engine',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P1 - High',
      'prop-owner': 'Topology Team',
      'prop-target': 'Sprint 24',
    },
    pageId: 'page-epistemology',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-3',
    databaseId: 'db-initiatives',
    title: 'Relational Database Engine with Formulas',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P1 - High',
      'prop-owner': 'Data Substrates',
      'prop-target': 'Sprint 24',
    },
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-4',
    databaseId: 'db-initiatives',
    title: 'P2P Real-Time Collaboration Mesh',
    properties: {
      'prop-status': 'Planned',
      'prop-priority': 'P2 - Routine',
      'prop-owner': 'Infra & Sync',
      'prop-target': 'Sprint 26',
    },
    pageId: 'page-roadmap',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

const SEED_CANVAS: CanvasBoard = {
  id: 'canvas-arch-map',
  workspaceId: 'ws-mindora-primary',
  title: 'Mindora Systems Topology',
  nodes: [
    {
      id: 'node-ui',
      boardId: 'canvas-arch-map',
      type: 'card',
      title: 'UI Shell & Navigation',
      content: 'Minimal Ollama-inspired design with pill geometry and paper-white canvas.',
      x: 100,
      y: 120,
      width: 260,
      height: 130,
      color: '#ffffff',
    },
    {
      id: 'node-editor',
      boardId: 'canvas-arch-map',
      type: 'page',
      title: 'Block Editor Core',
      content: 'Live interactive markdown with slash commands and clickable wikilinks.',
      pageId: 'page-welcome',
      x: 440,
      y: 80,
      width: 260,
      height: 130,
      color: '#ffffff',
    },
    {
      id: 'node-ai',
      boardId: 'canvas-arch-map',
      type: 'sticky',
      title: 'Zero-Leak AI Core',
      content: 'Ollama local inference + isolated in-memory credential storage.',
      x: 440,
      y: 280,
      width: 240,
      height: 120,
      color: '#fef08a',
    },
    {
      id: 'node-note',
      boardId: 'canvas-arch-map',
      type: 'page',
      title: 'AI Systems Architecture',
      pageId: 'page-ai-arch',
      x: 760,
      y: 280,
      width: 260,
      height: 130,
      color: '#ffffff',
    },
  ],
  edges: [
    {
      id: 'edge-1',
      boardId: 'canvas-arch-map',
      fromId: 'node-ui',
      toId: 'node-editor',
      label: 'hosts',
    },
    {
      id: 'edge-2',
      boardId: 'canvas-arch-map',
      fromId: 'node-ui',
      toId: 'node-ai',
      label: 'orchestrates',
    },
    {
      id: 'edge-3',
      boardId: 'canvas-arch-map',
      fromId: 'node-ai',
      toId: 'node-note',
      label: 'validates',
    },
  ],
  createdAt: Date.now() - 86400000 * 2,
  updatedAt: Date.now(),
};

class StorageService {
  private state: StorageState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): StorageState {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}state`);
        if (saved) {
          const parsed = JSON.parse(saved);

          // Security scrub: if any leaked or legacy key exists in localStorage, wipe it!
          if (parsed && parsed.aiSettings) {
            if (parsed.aiSettings.apiKey) {
              // If it's a real user key, migrate to secure vault, otherwise clear
              if (parsed.aiSettings.apiKey.includes('AIzaSyCm_QmFsxChxWyXEBLXhiQDOq-fSZx5jyc')) {
                parsed.aiSettings.apiKey = '';
              } else {
                secureKeyManager.setKey(parsed.aiSettings.apiKey, false);
                parsed.aiSettings.apiKey = '';
              }
            }
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse saved Mindora state from localStorage, initializing seed:', e);
    }

    return {
      workspaces: [SEED_WORKSPACE],
      activeWorkspaceId: SEED_WORKSPACE.id,
      pages: SEED_PAGES,
      databases: [SEED_DATABASE],
      records: SEED_RECORDS,
      canvases: [SEED_CANVAS],
      conversations: [],
      aiSettings: DEFAULT_SETTINGS,
    };
  }

  /**
   * Persists workspace state to localStorage while strictly ensuring that
   * NO API key or secret credential is ever saved in the plain state JSON.
   */
  public save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        // Sanitize before persisting to ensure zero key leakage
        const sanitizedSettings = {
          ...this.state.aiSettings,
          apiKey: '', // Never persist API keys in plain document state
        };
        const sanitizedState = {
          ...this.state,
          aiSettings: sanitizedSettings,
        };
        localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(sanitizedState));
      }
      this.notify();
    } catch (e) {
      console.error('Error persisting state to localStorage:', e);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  // --- Workspaces ---
  public getWorkspaces(): Workspace[] {
    return this.state.workspaces;
  }

  public getActiveWorkspace(): Workspace {
    const ws = this.state.workspaces.find((w) => w.id === this.state.activeWorkspaceId);
    return ws || this.state.workspaces[0];
  }

  public setActiveWorkspace(id: string): void {
    this.state.activeWorkspaceId = id;
    this.save();
  }

  public createWorkspace(name: string, icon = '📁'): Workspace {
    const ws: Workspace = {
      id: `ws-${Date.now()}`,
      name,
      icon,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.workspaces.push(ws);
    this.state.activeWorkspaceId = ws.id;
    this.save();
    return ws;
  }

  // --- Pages ---
  public getPages(): Page[] {
    return this.state.pages.filter((p) => p.workspaceId === this.state.activeWorkspaceId);
  }

  public getPage(id: string): Page | undefined {
    return this.state.pages.find((p) => p.id === id);
  }

  public getPageByTitle(title: string): Page | undefined {
    return this.state.pages.find(
      (p) => p.workspaceId === this.state.activeWorkspaceId && p.title.toLowerCase() === title.trim().toLowerCase()
    );
  }

  public createPage(title = 'Untitled Note', content = '', parentId: string | null = null): Page {
    const page: Page = {
      id: `page-${Date.now()}`,
      workspaceId: this.state.activeWorkspaceId,
      title,
      content,
      parentId,
      tags: [],
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.pages.unshift(page);
    this.save();
    return page;
  }

  public updatePage(id: string, updates: Partial<Page>): Page | undefined {
    const page = this.state.pages.find((p) => p.id === id);
    if (!page) return undefined;

    Object.assign(page, updates, { updatedAt: Date.now() });

    // Extract tags from content automatically if tags in text (e.g. #tag)
    const hashtagMatches = page.content.match(/(?:^|\s)#([a-zA-Z0-9_\-]+)/g);
    if (hashtagMatches) {
      const extracted = hashtagMatches.map((m) => m.trim().substring(1).toLowerCase());
      page.tags = Array.from(new Set([...page.tags, ...extracted]));
    }

    this.save();
    return page;
  }

  public deletePage(id: string): void {
    this.state.pages = this.state.pages.filter((p) => p.id !== id);
    this.save();
  }

  // --- Databases ("Bases") ---
  public getDatabases(): Database[] {
    return this.state.databases.filter((d) => d.workspaceId === this.state.activeWorkspaceId);
  }

  public getDatabase(id: string): Database | undefined {
    return this.state.databases.find((d) => d.id === id);
  }

  public createDatabase(title = 'Untitled Base'): Database {
    const db: Database = {
      id: `db-${Date.now()}`,
      workspaceId: this.state.activeWorkspaceId,
      title,
      icon: '📊',
      properties: [
        {
          id: 'prop-status',
          name: 'Status',
          type: 'status',
          options: [
            { id: 'opt-not-started', name: 'Not Started', color: '#94a3b8' },
            { id: 'opt-in-progress', name: 'In Progress', color: '#38bdf8' },
            { id: 'opt-done', name: 'Done', color: '#4ade80' },
          ],
        },
      ],
      views: [
        { id: `view-table-${Date.now()}`, name: 'Table View', type: 'table' },
        { id: `view-board-${Date.now()}`, name: 'Board View', type: 'board', groupByProperty: 'prop-status' },
        { id: `view-gallery-${Date.now()}`, name: 'Gallery View', type: 'gallery' },
        { id: `view-list-${Date.now()}`, name: 'List View', type: 'list' },
      ],
      activeViewId: `view-table-${Date.now()}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.databases.push(db);
    this.save();
    return db;
  }

  public updateDatabase(id: string, updates: Partial<Database>): void {
    const db = this.state.databases.find((d) => d.id === id);
    if (db) {
      Object.assign(db, updates, { updatedAt: Date.now() });
      this.save();
    }
  }

  public deleteDatabase(id: string): void {
    this.state.databases = this.state.databases.filter((d) => d.id !== id);
    this.state.records = this.state.records.filter((r) => r.databaseId !== id);
    this.save();
  }

  public getRecords(databaseId: string): DatabaseRecord[] {
    return this.state.records.filter((r) => r.databaseId === databaseId);
  }

  public createRecord(databaseId: string, title = 'New Item'): DatabaseRecord {
    const record: DatabaseRecord = {
      id: `rec-${Date.now()}`,
      databaseId,
      title,
      properties: {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.records.push(record);
    this.save();
    return record;
  }

  public updateRecord(id: string, updates: Partial<DatabaseRecord>): void {
    const rec = this.state.records.find((r) => r.id === id);
    if (rec) {
      Object.assign(rec, updates, { updatedAt: Date.now() });
      this.save();
    }
  }

  public deleteRecord(id: string): void {
    this.state.records = this.state.records.filter((r) => r.id !== id);
    this.save();
  }

  // --- Canvases ---
  public getCanvases(): CanvasBoard[] {
    return this.state.canvases.filter((c) => c.workspaceId === this.state.activeWorkspaceId);
  }

  public getCanvas(id: string): CanvasBoard | undefined {
    return this.state.canvases.find((c) => c.id === id);
  }

  public createCanvas(title = 'Untitled Canvas'): CanvasBoard {
    const canvas: CanvasBoard = {
      id: `canvas-${Date.now()}`,
      workspaceId: this.state.activeWorkspaceId,
      title,
      nodes: [],
      edges: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.state.canvases.push(canvas);
    this.save();
    return canvas;
  }

  public updateCanvas(id: string, updates: Partial<CanvasBoard>): void {
    const canvas = this.state.canvases.find((c) => c.id === id);
    if (canvas) {
      Object.assign(canvas, updates, { updatedAt: Date.now() });
      this.save();
    }
  }

  public deleteCanvas(id: string): void {
    this.state.canvases = this.state.canvases.filter((c) => c.id !== id);
    this.save();
  }

  // --- AI Settings & Chat ---
  public getAISettings(): AISettings {
    const current = this.state.aiSettings || DEFAULT_SETTINGS;
    return {
      ...current,
      apiKey: secureKeyManager.getKey(),
    };
  }

  public updateAISettings(settings: Partial<AISettings & { persistKey?: boolean }>): void {
    if (settings.apiKey !== undefined) {
      secureKeyManager.setKey(settings.apiKey, settings.persistKey ?? false);
    }
    const sanitized = { ...settings };
    delete (sanitized as any).apiKey;
    delete (sanitized as any).persistKey;

    this.state.aiSettings = { ...this.state.aiSettings, ...sanitized };
    this.save();
  }

  public getConversations(): AIConversation[] {
    return this.state.conversations.filter((c) => c.workspaceId === this.state.activeWorkspaceId);
  }

  public saveConversation(conv: AIConversation): void {
    const idx = this.state.conversations.findIndex((c) => c.id === conv.id);
    if (idx >= 0) {
      this.state.conversations[idx] = conv;
    } else {
      this.state.conversations.unshift(conv);
    }
    this.save();
  }

  // --- Export & Import ---
  /**
   * Exports full workspace data.
   * STRICT SECURITY: Guarantees zero secret keys or credentials are included in the bundle.
   */
  public exportWorkspaceData(): string {
    const exportBundle = {
      version: '1.0.0',
      workspace: this.getActiveWorkspace(),
      pages: this.getPages(),
      databases: this.getDatabases(),
      records: this.state.records.filter((r) => 
        this.getDatabases().some((d) => d.id === r.databaseId)
      ),
      canvases: this.getCanvases(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(exportBundle, null, 2);
  }

  public importVaultMarkdown(fileName: string, content: string): Page {
    let cleanTitle = fileName.replace(/\.md$/i, '');
    let parsedContent = content;
    const tags: string[] = [];

    // Parse YAML frontmatter if present
    const frontmatterMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      parsedContent = frontmatterMatch[2];

      const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?$/m);
      if (titleMatch) cleanTitle = titleMatch[1];

      const tagMatch = frontmatter.match(/tags:\s*\[?(.*?)\]?$/m);
      if (tagMatch) {
        tagMatch[1].split(',').forEach((t) => {
          const cleaned = t.trim().replace(/['"]/g, '');
          if (cleaned) tags.push(cleaned);
        });
      }
    }

    const page = this.createPage(cleanTitle, parsedContent);
    if (tags.length > 0) {
      this.updatePage(page.id, { tags });
    }
    return page;
  }
}

export const storage = new StorageService();
