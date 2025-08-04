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

const DEFAULT_API_KEY = 
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) ||
  'AIzaSyCm_QmFsxChxWyXEBLXhiQDOq-fSZx5jyc';

const DEFAULT_SETTINGS: AISettings = {
  provider: 'gemini',
  apiKey: DEFAULT_API_KEY,
  model: 'gemini-3.6-flash',
  temperature: 0.7,
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

> **Core Philosophy**: Information should be interconnected, not isolated. Finding something should be faster than remembering where it was saved, and AI should understand the workspace rather than merely answering isolated prompts.

---

## ⚡ What Makes Mindora Different

Mindora combines four primary capabilities into one canonical data model:

1. **World-Class Block Editor**: Write fluidly with slash commands (\`/\`), live widgets, checklists, code blocks, and math equations.
2. **First-Class Interconnected Knowledge**: Every document supports bidirectional Wikilinks (\`[[Page Title]]\`) with instantaneous resolution and interactive force-directed graph exploration.
3. **Relational Databases & Collections**: Bring Notion-style tables, Kanban boards, and multi-property collections directly alongside documents.
4. **Context-Aware Workspace AI**: Powered by hybrid semantic retrieval and multi-provider LLMs. The assistant reads your actual documents and provides verifiable citations.

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
| \`- [ ]\` | Create an interactive checklist item |
| \`> \` | Create a callout or quote |

- [x] Test the rich block editor
- [x] Inspect the bidirectional knowledge graph
- [ ] Connect your AI API key in Settings (or use intelligent local fallback)
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
Embedding Generation (OpenAI / Gemini / Local)
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
- **Google Gemini**: Rapid, low-latency reasoning via \`gemini-2.5-flash\`
- **Anthropic Claude**: Complex synthesis via \`claude-3-5-sonnet\`
- **OpenAI**: \`gpt-4o\` and reasoning models
- **Ollama**: Zero-cloud, 100% private local inference on \`http://localhost:11434\`
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

## 🔗 The Power of Bidirectional Links

When you write \`[[Welcome to Mindora]]\` or \`[[AI Systems Architecture]]\`, Mindora registers an explicit edge in the global knowledge graph.

### Graph Metrics
- **Degree Centrality**: Highly referenced nodes grow larger dynamically.
- **Neighborhood Subgraphs**: Filter to only 1-hop or 2-hop connections around the active note.
- **Orphan Detection**: Identify thoughts that have become isolated.

> "A thought that is not connected to any other thought is like an unindexed file: it exists, but cannot be retrieved when needed."
`,
  },
  {
    id: 'page-roadmap',
    workspaceId: 'ws-mindora-primary',
    title: 'Product Roadmap 2026',
    icon: '🚀',
    tags: ['roadmap', 'strategy', 'engineering'],
    isFavorite: false,
    parentId: null,
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
    content: `# Product Roadmap 2026

Strategic milestones for Mindora's evolution into the premier AI-native knowledge workspace.

---

## 🎯 Q1 2026 — Core Workspace Foundation
- [x] Unified document and block editor
- [x] Bidirectional Wikilinks and backlinks index
- [x] Notion-style Relational Databases ("Bases")
- [x] Interactive Knowledge Graph with force-directed physics
- [x] Infinite Visual Knowledge Canvas
- [x] Multi-provider AI assistant with grounded workspace citations

## 🚀 Q2 2026 — Advanced Synthesis & MCP
- [ ] Model Context Protocol (MCP) server & client integration
- [ ] Graph-RAG community clustering
- [ ] Real-time peer-to-peer CRDT collaboration
- [ ] Mobile companion app with offline cache sync

Refer to [[AI Systems Architecture]] and [[Welcome to Mindora]] for architectural foundations.
`,
  },
];

const SEED_DATABASE: Database = {
  id: 'db-initiatives',
  workspaceId: 'ws-mindora-primary',
  title: 'Mindora Engineering Initiatives',
  description: 'Tracking high-priority platform deliverables and feature milestones.',
  icon: '📊',
  properties: [
    {
      id: 'prop-status',
      name: 'Status',
      type: 'status',
      options: [
        { id: 'opt-in-progress', name: 'In Progress', color: '#38BDF8' },
        { id: 'opt-completed', name: 'Completed', color: '#4ADE80' },
        { id: 'opt-planned', name: 'Planned', color: '#A78BFA' },
      ],
    },
    {
      id: 'prop-priority',
      name: 'Priority',
      type: 'select',
      options: [
        { id: 'p0', name: 'P0 - Critical', color: '#F87171' },
        { id: 'p1', name: 'P1 - Core', color: '#FBBF24' },
        { id: 'p2', name: 'P2 - Enhancement', color: '#60A5FA' },
      ],
    },
    {
      id: 'prop-category',
      name: 'Category',
      type: 'select',
      options: [
        { id: 'cat-core', name: 'Core Engine', color: '#818CF8' },
        { id: 'cat-ai', name: 'AI & Retrieval', color: '#C084FC' },
        { id: 'cat-ui', name: 'User Interface', color: '#34D399' },
      ],
    },
    {
      id: 'prop-target',
      name: 'Target Quarter',
      type: 'text',
    },
  ],
  views: [
    {
      id: 'view-table',
      name: 'All Initiatives (Table)',
      type: 'table',
    },
    {
      id: 'view-board',
      name: 'By Status (Kanban)',
      type: 'board',
      groupByProperty: 'prop-status',
    },
  ],
  activeViewId: 'view-table',
  createdAt: Date.now() - 86400000 * 3,
  updatedAt: Date.now(),
};

const SEED_RECORDS: DatabaseRecord[] = [
  {
    id: 'rec-1',
    databaseId: 'db-initiatives',
    title: 'Block Editor & Slash Command Engine',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P0 - Critical',
      'prop-category': 'Core Engine',
      'prop-target': 'Q1 2026',
    },
    pageId: 'page-welcome',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-2',
    databaseId: 'db-initiatives',
    title: 'Incremental Semantic Vector Retrieval Pipeline',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P0 - Critical',
      'prop-category': 'AI & Retrieval',
      'prop-target': 'Q1 2026',
    },
    pageId: 'page-ai-arch',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-3',
    databaseId: 'db-initiatives',
    title: 'Bidirectional Knowledge Graph & Force Physics',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P1 - Core',
      'prop-category': 'Core Engine',
      'prop-target': 'Q1 2026',
    },
    pageId: 'page-epistemology',
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-4',
    databaseId: 'db-initiatives',
    title: 'Multi-View Relational Database ("Bases")',
    properties: {
      'prop-status': 'Completed',
      'prop-priority': 'P0 - Critical',
      'prop-category': 'Core Engine',
      'prop-target': 'Q1 2026',
    },
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
  },
  {
    id: 'rec-5',
    databaseId: 'db-initiatives',
    title: 'Model Context Protocol (MCP) Server/Client Bridge',
    properties: {
      'prop-status': 'Planned',
      'prop-priority': 'P2 - Enhancement',
      'prop-category': 'AI & Retrieval',
      'prop-target': 'Q2 2026',
    },
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now(),
  },
];

const SEED_CANVAS: CanvasBoard = {
  id: 'canvas-arch-map',
  workspaceId: 'ws-mindora-primary',
  title: 'System Architecture Map',
  nodes: [
    {
      id: 'node-ui',
      boardId: 'canvas-arch-map',
      type: 'card',
      title: 'Mindora UI Shell (React 19 + Vite)',
      content: 'Unified navigation, command palette, theme provider & reactive state store.',
      x: 100,
      y: 120,
      width: 260,
      height: 120,
      color: '#4F46E5',
    },
    {
      id: 'node-editor',
      boardId: 'canvas-arch-map',
      type: 'page',
      title: 'Welcome to Mindora',
      pageId: 'page-welcome',
      x: 450,
      y: 80,
      width: 240,
      height: 100,
      color: '#0284C7',
    },
    {
      id: 'node-ai',
      boardId: 'canvas-arch-map',
      type: 'page',
      title: 'AI Systems Architecture',
      pageId: 'page-ai-arch',
      x: 450,
      y: 260,
      width: 240,
      height: 100,
      color: '#9333EA',
    },
    {
      id: 'node-note',
      boardId: 'canvas-arch-map',
      type: 'sticky',
      title: 'Design Rule',
      content: 'Never separate AI into an isolated tab. Ground it deeply in document context.',
      x: 780,
      y: 180,
      width: 220,
      height: 130,
      color: '#CA8A04',
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
          if (parsed && parsed.aiSettings && (!parsed.aiSettings.apiKey || parsed.aiSettings.model !== 'gemini-3.6-flash')) {
            parsed.aiSettings.apiKey = DEFAULT_API_KEY;
            parsed.aiSettings.model = 'gemini-3.6-flash';
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

  public save(): void {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(this.state));
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

  public createPage(title = 'Untitled', content = '', parentId: string | null = null): Page {
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
            { id: 'opt-not-started', name: 'Not Started', color: '#94A3B8' },
            { id: 'opt-in-progress', name: 'In Progress', color: '#38BDF8' },
            { id: 'opt-done', name: 'Done', color: '#4ADE80' },
          ],
        },
      ],
      views: [
        { id: `view-table-${Date.now()}`, name: 'Table View', type: 'table' },
        { id: `view-board-${Date.now()}`, name: 'Board View', type: 'board', groupByProperty: 'prop-status' },
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

  // --- AI Settings & Chat ---
  public getAISettings(): AISettings {
    return this.state.aiSettings || DEFAULT_SETTINGS;
  }

  public updateAISettings(settings: Partial<AISettings>): void {
    this.state.aiSettings = { ...this.getAISettings(), ...settings };
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
