# Mindora — The AI-Native Knowledge Workspace

Mindora is an autonomous, AI-native knowledge workspace designed to synthesize the strongest attributes of modern thought and productivity tools into one cohesive, fluid, local-first application.

It combines:
- **Notion's** fluid document experience and relational databases ("Bases").
- **Obsidian's** bidirectional knowledge graph, wikilinks (`[[...]]`), and complete Markdown data portability.
- **Folio's** modular block editor, rich widgets, multi-view collections, and visual canvas whiteboard.
- **Atomic's** semantic knowledge retrieval pipeline, hybrid search (BM25 + vector cosine similarity), and grounded multi-provider AI assistant.
- **SilverBullet's** extensibility and keyboard-first command launcher.

---

## ⚡ Core Capabilities

### 1. World-Class Block Editor
- **Slash Commands (`/`)**: Instantly insert Headings (H1–H3), Checklists, Callouts, Code Blocks, Tables, Math LaTeX equations, and AI drafts.
- **Bidirectional Wikilinks (`[[Page Title]]`)**: Real-time auto-completion when typing `[[`, instant cross-document navigation, and automatic backlink detection.
- **Interactive Widgets**:
  - Clickable checklists (`- [ ]` toggles to `- [x]` directly in storage).
  - High-visibility Callout boxes (Info, Warning, Tip) with custom badges and icons.
  - Code blocks with syntax language selector and one-click copy.
  - Live side-by-side Markdown & preview, or full reading mode.
- **Floating AI Selection Toolbar**: Select any text block to trigger instant AI operations: *Improve Writing*, *Summarize*, *Extract Tasks*, *Generate Outline*, and *Explain*.
- **Autosave & Local Recovery**: Debounced background persistence to browser storage with real-time save status.

### 2. Relational Databases & Collections ("Bases")
- **Multiple Views**:
  - **Table View**: Editable cells, column type headers, filter and sort controls, add row/column.
  - **Board View (Kanban)**: Drag and group cards by Status or Select properties.
  - **List View**: Minimalist row list with key attributes.
  - **Gallery View**: Responsive visual cards grid.
- **Property Types**: Text, Number, Select, Multi-select, Status, Date, Checkbox, URL.
- **Linked Documents**: Open any database record as a rich, full-page document.

### 3. Interactive Force-Directed Knowledge Graph
- **Physics Simulation**: Dynamic node repulsion, spring link attraction, and center gravity.
- **Degree Centrality Sizing**: Nodes scale dynamically based on the number of inbound and outbound links.
- **Color-Coded Types**: Pages (Indigo), Databases (Emerald), Active Note (Sky Blue).
- **Local vs. Global Graph**: Toggle between global workspace map and a focused 1-hop neighborhood subgraph around your active note.
- **Interactive Exploration**: Pan, zoom, node hover tooltips with link counts and excerpts, and click-to-navigate.

### 4. Infinite Visual Knowledge Canvas
- **Spatial Whiteboard**: Infinite 2D panning and zooming space.
- **Interactive Cards**: Document Cards (linked to workspace notes), Sticky Notes (annotations), and Architecture Blocks.
- **Curved Connection Arrows**: Visual SVG bezier curves linking connected thoughts.
- **Seamless Integration**: Click any document card to immediately open it in the editor.

### 5. Mindora AI — Multi-Provider Workspace Intelligence
- **Multi-Provider LLM Gateway**:
  - **Google Gemini**: High-speed, high-context generation (`gemini-2.5-flash`).
  - **Anthropic Claude**: Complex synthesis (`claude-3-5-sonnet`).
  - **OpenAI**: `gpt-4o` and `gpt-4o-mini`.
  - **Ollama**: 100% private local inference (`llama3.2`, `mistral`) with zero cloud data transmission.
  - **OpenRouter**: Unified endpoint for hundreds of models.
- **Grounded Semantic Retrieval Pipeline**:
  - Automatically chunks workspace notes by heading boundaries.
  - Computes semantic vectors and keyword frequencies.
  - Employs hybrid search to retrieve the most relevant workspace context.
  - Generates answers with clickable workspace citations (`[Page Title]`) linking directly to the underlying notes.
- **Zero-Cloud Local Fallback Engine**: If no API key is configured or when offline, Mindora's built-in client-side hybrid engine answers questions and synthesizes notes locally without failing or throwing errors.

### 6. Obsidian Vault Import & 100% Data Ownership
- **Obsidian Vault Import**: Drag-and-drop or select `.md` notes. Mindora preserves folder hierarchies, YAML frontmatter, tags, and `[[wikilinks]]`.
- **Full Workspace Export**: One-click download of your entire workspace (notes, databases, canvas boards, graph state) as a JSON bundle or Markdown archive.

---

## 🏗️ System Architecture

```text
Mindora/
├── docs/
│   ├── ARCHITECTURE.md          # Full system architecture specification
│   ├── DATA_MODEL.md            # Canonical entity schemas (Page, Base, Canvas, Graph)
│   ├── AI_ARCHITECTURE.md       # Semantic retrieval & LLM provider gateway
│   ├── FOUNDATION_DECISION.md   # Architectural selection rationale
│   ├── LICENSING_AUDIT.md       # Open-source licensing compliance & AGPL quarantine
│   ├── UPSTREAM_AUDIT.md        # 10-repository comparative audit matrix
│   └── FEATURE_PROVENANCE.md    # Source origin and modification trail
├── research/
│   └── upstream/                # Isolated reference clones (Folio, Atomic, AFFiNE, etc.)
├── src/
│   ├── components/
│   │   ├── ai/                  # AI Assistant panel & citations
│   │   ├── bases/               # Relational database views (Table, Board, List, Gallery)
│   │   ├── canvas/              # Infinite visual whiteboard
│   │   ├── editor/              # Rich block editor with slash commands & wikilinks
│   │   ├── graph/               # Force-directed knowledge graph
│   │   ├── import/              # Obsidian vault import & workspace export modal
│   │   ├── layout/              # Sidebar & top navigation header
│   │   ├── search/              # Command palette (Cmd+K)
│   │   └── settings/            # AI provider gateway settings
│   ├── services/
│   │   ├── ai.ts                # Semantic chunking, hybrid search & LLM API calls
│   │   ├── graph.ts             # Wikilink resolution, backlinks & topology
│   │   └── storage.ts           # Canonical reactive persistence & seed data
│   ├── styles/                  # Tailwind CSS v4 styling & typography
│   ├── types/                   # Canonical TypeScript data contracts
│   ├── App.tsx                  # Main application shell
│   └── main.tsx                 # React 19 entry point
├── tests/                       # Vitest automated test suite
├── THIRD_PARTY_NOTICES.md       # Complete attribution inventory
└── THIRD_PARTY_LICENSES/        # Upstream permissive license texts
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js `>= 20.0` (tested on Node v24)
- npm or pnpm

### Installation
```bash
git clone https://github.com/your-org/Mindora.git
cd Mindora
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Automated Tests
```bash
npm run test
```
Runs the full Vitest unit and integration test suite across storage, knowledge graph, and AI semantic retrieval.

### Production Build
```bash
npm run build
```
Generates an optimized, minified production build in the `dist/` directory.

---

## ⚖️ License & Code Provenance
Mindora is released under the **MIT License**.
See [docs/LICENSING_AUDIT.md](docs/LICENSING_AUDIT.md), [docs/FEATURE_PROVENANCE.md](docs/FEATURE_PROVENANCE.md), and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for full attribution of permissive open-source components.

