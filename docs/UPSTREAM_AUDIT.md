# Upstream Repository Audit & Comparative Matrix

## 1. Audit Overview

To engineer Mindora as a unified, world-class knowledge workspace, 10 leading open-source repositories were cloned into `research/upstream/` and audited across user experience, software architecture, data modeling, AI integration, and code quality.

---

## 2. Comparative Evaluation Matrix

| Repository | Upstream License | Editor Experience (20%) | UI Architecture (15%) | Data Model (15%) | Maintainability (15%) | AI Potential (15%) | Search & Graph (10%) | Portability (5%) | Total Weighted Score | Verdict |
|---|---|---|---|---|---|---|---|---|---|---|
| **Folio** | MIT | 19 / 20 | 14 / 15 | 14 / 15 | 14 / 15 | 13 / 15 | 9 / 10 | 5 / 5 | **88 / 100** | **Selected Foundation Shell** |
| **Atomic** | MIT | 15 / 20 | 14 / 15 | 13 / 15 | 13 / 15 | 15 / 15 | 9 / 10 | 5 / 5 | **84 / 100** | **Selected AI Intelligence Engine** |
| **AFFiNE** | Mixed / MIT | 18 / 20 | 14 / 15 | 13 / 15 | 9 / 15 | 12 / 15 | 7 / 10 | 4 / 5 | **77 / 100** | Architectural Reference (Monorepo complexity) |
| **NoteDiscovery** | MIT | 14 / 20 | 11 / 15 | 12 / 15 | 12 / 15 | 11 / 15 | 8 / 10 | 5 / 5 | **73 / 100** | Selected Graph & Obsidian Reference |
| **SilverBullet** | MIT | 16 / 20 | 11 / 15 | 13 / 15 | 12 / 15 | 10 / 15 | 8 / 10 | 5 / 5 | **75 / 100** | Selected Query & Extensibility Reference |
| **AppFlowy / Web** | AGPL-3.0 | 17 / 20 | 13 / 15 | 14 / 15 | 10 / 15 | 11 / 15 | 7 / 10 | 4 / 5 | **Excluded (AGPL)** | Architectural Reference for Databases |
| **Docmost** | AGPL-3.0 | 16 / 20 | 13 / 15 | 12 / 15 | 12 / 15 | 9 / 15 | 7 / 10 | 4 / 5 | **Excluded (AGPL)** | Architectural Reference for Collaboration |
| **SiYuan** | AGPL-3.0 | 16 / 20 | 10 / 15 | 14 / 15 | 11 / 15 | 8 / 15 | 7 / 10 | 4 / 5 | **Excluded (AGPL)** | Architectural Reference for Block Refs |
| **Logseq** | AGPL-3.0 | 16 / 20 | 11 / 15 | 13 / 15 | 10 / 15 | 8 / 15 | 8 / 10 | 4 / 5 | **Excluded (AGPL)** | Architectural Reference for Outliners |

---

## 3. Deep Dive Findings by Repository

### Folio (`evergreen-it-dev/folio`)
- **Strengths**: MIT license. Exceptionally modular TypeScript + React 19 + Vite frontend. Features a rich block-and-widget editor with tables, callouts, emojis, task lists, and slash menu. Has built-in databases ("bases") with table and board views, canvas whiteboard views, and clean separation between client and storage.
- **Weaknesses**: AI capabilities in upstream were tied to basic LLM completions without hybrid vector retrieval or cross-workspace semantic indexing.
- **Role in Mindora**: Chosen as the primary application foundation for documents, editor, databases, and visual canvas.

### Atomic (`kenforthewin/atomic`)
- **Strengths**: MIT license. Kenneth Bergquist's production-grade AI semantic retrieval architecture. Implements hybrid keyword + vector search, embedding generation, chunking pipeline, and multi-provider abstraction (OpenAI, Anthropic, Gemini, Ollama). Has a battle-tested chat interface with grounded workspace citations.
- **Weaknesses**: Focused primarily on atomic notes rather than full Notion-style multi-property databases.
- **Role in Mindora**: Integrated as Mindora's AI Intelligence, semantic indexing, and hybrid retrieval layer.

### NoteDiscovery (`gamosoft/NoteDiscovery`)
- **Strengths**: MIT license. Strong Obsidian vault compatibility, wikilink resolution (`[[Page]]`), backlink harvesting, and graph visualization algorithms.
- **Role in Mindora**: Guided the Obsidian vault import engine, wikilink parsing, and knowledge graph visualization.

### SilverBullet (`silverbulletmd/silverbullet`)
- **Strengths**: MIT license. Powerful live query syntax (`query` blocks) for aggregating pages, tasks, and tags. Fast keyboard navigation.
- **Role in Mindora**: Informed the query block rendering and keyboard shortcut registry.

### AFFiNE (`toeverything/AFFiNE`)
- **Strengths**: Pioneer of dual document-canvas integration and BlockSuite.
- **Weaknesses**: Monolithic repository (>10,000 files), complex Rust native bindings (NAPI-RS), heavy dependencies, mixed licenses.
- **Role in Mindora**: Studied for the fluid document-to-canvas mode transition UX.

### AGPL Codebases (AppFlowy, Docmost, SiYuan, Logseq)
- **Status**: Audited strictly for UX workflows, database property models, and outliner hierarchies. All code remains strictly isolated in `research/upstream/` to preserve Mindora's clean MIT license.

