# Mindora Application Architecture

## 1. System Overview

Mindora is an AI-native knowledge workspace built on a single, coherent, local-first architecture. It integrates document writing, Notion-like relational databases, Obsidian-like knowledge graphs, infinite visual canvases, and semantic AI synthesis into a single unified application.

```text
+----------------------------------------------------------------------------------+
|                                    MINDORA                                       |
|                                                                                  |
|  +----------------------------------------------------------------------------+  |
|  |             Header: Workspace Switcher | Search (Cmd+K) | Theme | AI Panel |  |
|  +----------------------------------------------------------------------------+  |
|  |            |                                                               |  |
|  |  SIDEBAR   |                     MAIN VIEW CONTAINER                       |  |
|  |            |                                                               |  |
|  | - Favorites|  [Documents]     [Databases]     [Knowledge Graph]  [Canvas]  |  |
|  | - Pages    |  Rich Block      Table / Board   Force-Directed     Infinite  |  |
|  | - Bases    |  Slash Commands  Multi-Property  Physics Engine     Spatial   |  |
|  | - Graph    |  Widgets         Filter & Sort   Backlinks          Cards     |  |
|  | - Canvas   |  Wikilinks       Inline Edit     Neighborhood       Arrows    |  |
|  | - AI Chat  |                                                               |  |
|  | - Import   |                                                               |  |
|  +------------+---------------------------------------------------------------+  |
|  |                                                                               |
|  |               AI INTELLIGENCE & SEMANTIC RETRIEVAL LAYER                       |
|  |    Multi-Provider (Gemini/OpenAI/Claude/Ollama) | Embeddings | Hybrid Search  |
|  +-------------------------------------------------------------------------------+
|  |                                                                               |
|  |                CANONICAL LOCAL STORAGE & STATE LAYER                          |
|  |             IndexedDB / LocalStorage / Markdown Import-Export                 |
|  +-------------------------------------------------------------------------------+
+----------------------------------------------------------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Single Application Shell
- Built with **React 19**, **TypeScript**, **Vite**, and **Tailwind CSS**.
- Fluid transitions between Document View, Database View, Knowledge Graph, and Visual Canvas without reloading or state destruction.
- Keyboard-first command palette (`Cmd+K` / `Ctrl+K`) for universal search and instant navigation.

### B. Canonical Reactive State Store
- Single source of truth for workspaces, documents, databases, canvas nodes, and tags.
- Reactive subscriptions update the document tree, backlinks index, and graph topology in real time.
- Instant autosave with recovery safeguards.

### C. First-Class AI Intelligence Layer
- Decoupled from any single proprietary LLM provider.
- Context-aware retrieval engine that chunks documents, computes semantic vectors, and performs hybrid search (BM25 keyword + cosine similarity).
- Grounded assistant providing verifiable workspace citations, inline document generation, and diff previews.

### D. 100% Data Ownership & Portability
- Offline-first execution: complete productivity with zero internet connection.
- 1-click Obsidian Vault import with complete preservation of folder structures, Wikilinks, frontmatter, and attachments.
- Full workspace export to clean Markdown documents and structured JSON.

