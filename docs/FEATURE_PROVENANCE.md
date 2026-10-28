# Feature Provenance & Modification Record

This document records each subsystem in Mindora, its upstream origin, modifications made, and licensing justification.

---

## 1. Document Workspace & Navigation
- **Origin**: Folio (`web/src/app`, `server/storage.ts`) + custom Mindora enhancements.
- **License**: MIT
- **Modifications**:
  - Unified workspace hierarchy with multi-workspace support.
  - Added dedicated navigation bar with integrated search palette, global AI status, and command launcher.
  - Streamlined breadcrumbs, favorites, tag filters, and recents list.

## 2. World-Class Block Editor
- **Origin**: Folio (`web/src/editor`) + BlockSuite / Obsidian conventions.
- **License**: MIT
- **Modifications**:
  - Markdown-first block architecture with real-time visual widgets (tables, callouts, math equations, code blocks, task lists, images).
  - Slash command menu (`/h1`, `/h2`, `/h3`, `/todo`, `/table`, `/callout`, `/quote`, `/code`, `/math`, `/canvas`, `/ai`).
  - Bidirectional Wikilink support (`[[Page Title]]`) with auto-completion and instantaneous target resolution.
  - Autosave with localStorage caching, dirty state tracking, and recovery.

## 3. Knowledge Graph Engine
- **Origin**: NoteDiscovery + Obsidian graph algorithms + custom SVG/Canvas force-directed rendering.
- **License**: MIT
- **Modifications**:
  - Global knowledge graph and local graph around current document.
  - Node sizing by degree centrality, color-coded node types (pages, tags, databases, canvas).
  - Dynamic physics simulation with zoom, pan, hover tooltips, and click-to-navigate.
  - Orphaned notes detection and unresolved wikilinks detection.

## 4. Databases & Collections ("Bases")
- **Origin**: Folio (`web/src/bases`) + AppFlowy concepts (reimplemented in MIT).
- **License**: MIT
- **Modifications**:
  - Multiple views: Table View, Kanban Board View, List View, Gallery View.
  - Property system: Text, Number, Select, Multi-select, Date, Checkbox, URL, Tags.
  - Dynamic filtering, sorting, and inline editing.
  - Direct linking between database records and rich documents.

## 5. Visual Knowledge Canvas
- **Origin**: Folio (`web/src/canvas`) + AFFiNE spatial concepts.
- **License**: MIT
- **Modifications**:
  - Infinite 2D visual canvas with zoom and pan.
  - Drag-and-drop cards representing documents, sticky notes, and connections.
  - Visual lines/arrows between connected ideas.
  - Seamless toggle between Document view and Canvas view.

## 6. AI Intelligence & Semantic Retrieval Layer
- **Origin**: Atomic (`src/components/chat`, `src/lib/api.ts`) + Mindora AI Orchestrator.
- **License**: MIT
- **Modifications**:
  - Multi-provider abstraction: Google Gemini, OpenAI, Anthropic Claude, Ollama (local), OpenRouter.
  - In-browser and server-backed embedding generation and vector cosine-similarity ranking.
  - Hybrid search combining full-text TF-IDF/BM25 token matching with semantic vector distance.
  - Grounded workspace synthesis with clickable document source citations.
  - Inline AI editor actions: "Improve writing", "Summarize", "Generate outline", "Translate", "Extract action items", "Explain".
  - Write proposals with diff preview and one-click accept/reject.

## 7. Import / Export & Local-First Data Ownership
- **Origin**: NoteDiscovery & SilverBullet & Atomic import engines.
- **License**: MIT
- **Modifications**:
  - Obsidian Vault import (parses Markdown files, folders, wikilinks, tags, frontmatter).
  - Full workspace export to clean Markdown + JSON bundle.
  - Offline capability with IndexedDB / LocalStorage persistence.

