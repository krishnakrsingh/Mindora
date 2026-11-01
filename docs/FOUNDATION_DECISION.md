# Foundation Decision: Engineering Synthesis for Mindora

## 1. Selected Primary Application Foundation: Folio + Atomic Fusion

Mindora selects **Folio** as its primary application foundation, synthesized directly with **Atomic's** semantic AI retrieval and multi-provider intelligence engine.

---

## 2. Rationale for Selection

1. **Strict Permissive Licensing (MIT)**:
   - Both Folio and Atomic are clean MIT-licensed repositories with active, modern maintenance.
   - Enables commercial distribution, enterprise deployment, and zero contamination from viral copyleft licenses (AGPL-3.0).

2. **Modern, High-Performance Tech Stack Synergy**:
   - Both Folio and Atomic share the modern web stack: **TypeScript, React, Vite, and Tailwind CSS**.
   - This allows deep, native integration into a single application shell without bridge wrappers, micro-frontends, or iframe hacks.

3. **Complementary Best-in-Class Capabilities**:
   - **Folio provides**:
     - Sophisticated block & widget editor with slash commands, tables, callouts, equations, code blocks, task lists, and inline formatting.
     - Notion-style database collections ("Bases") with table, board, and list views.
     - Visual canvas / whiteboard space for spatial diagramming.
     - Page tree, hierarchical document navigation, and Wikilink parsing.
   - **Atomic provides**:
     - Complete AI semantic retrieval pipeline: chunking, embedding generation, vector distance, and hybrid search.
     - Multi-provider LLM abstraction (OpenAI, Anthropic Claude, Google Gemini, Ollama, OpenRouter).
     - Grounded AI workspace assistant with document citations.
     - Command palette and search palette architecture.
   - **NoteDiscovery & SilverBullet provide**:
     - Obsidian vault import/export engine and wikilink graph algorithms.
     - Live query blocks and markdown portability.

4. **Rejected Alternatives**:
   - **AFFiNE Core Monorepo**: Rejected as primary shell due to immense build overhead (Rust toolchain, NAPI native modules, 10,000+ files) and mixed licensing restrictions. Reused conceptual patterns only.
   - **AppFlowy & Docmost**: Rejected due to AGPL-3.0 copyleft license. Their UI and database interaction concepts are reimplemented cleanly under MIT.
   - **SiYuan & Logseq**: Rejected due to AGPL-3.0 licensing and ClojureScript / custom storage engine complexity.

---

## 3. Subsystem Implementation Strategy

| Subsystem | Source / Approach | Implementation Status in Mindora |
|---|---|---|
| **Application Shell & Design System** | Original Mindora Design Language | Unified sidebar, top navigation, theme toggle (dark/light), command palette. |
| **Document Workspace** | Folio + Mindora enhancements | Hierarchical page tree, nested pages, collections, favorites, tags, recents. |
| **Block Editor** | Folio Block Engine + Wikilinks | Rich blocks, slash menu (`/`), formatting toolbar, inline widgets, math, tables. |
| **Knowledge Graph** | NoteDiscovery + Mindora D3/Canvas engine | Global & local interactive force-directed graph with physics, degree scaling, and click navigation. |
| **Databases & Collections** | Folio Bases + AppFlowy concepts (MIT) | Multi-property tables, Kanban boards, gallery views, filtering, sorting. |
| **Visual Canvas** | Folio Canvas + AFFiNE spatial concepts | Infinite zoom/pan whiteboard, connected document cards, sticky notes. |
| **AI Intelligence Layer** | Atomic AI Retrieval + Multi-provider | Multi-LLM provider abstraction, hybrid search, grounded Q&A with citations, inline AI rewrites. |
| **Data Portability** | NoteDiscovery / Obsidian engine | Full Markdown vault import, JSON export, offline LocalStorage / IndexedDB sync. |

---

## 4. Technical Risks & Mitigation
- **Risk 1: AI Provider Latency / API Outages**:
  - *Mitigation*: Application is 100% functional offline without AI. AI operations are asynchronous and non-blocking. Supports local Ollama for zero-cloud privacy.
- **Risk 2: Large Workspace Graph Performance**:
  - *Mitigation*: Graph view utilizes canvas/SVG acceleration and degree-based clustering with node limit filtering to easily handle thousands of notes smoothly.
- **Risk 3: Data Loss**:
  - *Mitigation*: Debounced autosave to local persistence with instant dirty state indicator and recovery buffer.

