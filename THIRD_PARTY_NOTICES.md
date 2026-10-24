# Third-Party Notices & Attribution Inventory

Mindora incorporates open-source software and architectural concepts subject to permissive open-source licenses. This document inventories all upstream components, their licenses, origins, and copyright notices.

---

## 1. Folio
- **Origin**: https://github.com/evergreen-it-dev/folio
- **License**: MIT License
- **Copyright**: Copyright (c) 2026 Evergreen and Folio contributors
- **License Text**: [THIRD_PARTY_LICENSES/FOLIO_LICENSE.txt](THIRD_PARTY_LICENSES/FOLIO_LICENSE.txt)
- **Role in Mindora**:
  - Document workspace architecture, hierarchical navigation, page tree.
  - Markdown block editor, widgets, callouts, tables, slash menu, toolbar, and Wikilink parsing.
  - Visual canvas and whiteboard interaction patterns.
  - Notion-like Base views (tables, boards, and collections).

---

## 2. Atomic
- **Origin**: https://github.com/kenforthewin/atomic
- **License**: MIT License
- **Copyright**: Copyright (c) 2025 Kenneth Bergquist
- **License Text**: [THIRD_PARTY_LICENSES/ATOMIC_LICENSE.txt](THIRD_PARTY_LICENSES/ATOMIC_LICENSE.txt)
- **Role in Mindora**:
  - AI semantic knowledge retrieval, chunking, and embedding generation concepts.
  - Multi-provider AI abstraction layer (OpenAI, Anthropic, Gemini, Ollama, OpenRouter).
  - Grounded AI assistant chat interface with workspace source citations and context assembly.
  - Command palette and search palette interaction patterns.

---

## 3. NoteDiscovery
- **Origin**: https://github.com/gamosoft/NoteDiscovery
- **License**: MIT License
- **Copyright**: Copyright (c) 2025 Gamosoft
- **License Text**: [THIRD_PARTY_LICENSES/NOTEDISCOVERY_LICENSE.txt](THIRD_PARTY_LICENSES/NOTEDISCOVERY_LICENSE.txt)
- **Role in Mindora**:
  - Obsidian vault compatibility patterns (wikilinks, frontmatter, attachment handling).
  - Bidirectional link graph visualization topology and clustering concepts.

---

## 4. SilverBullet
- **Origin**: https://github.com/silverbulletmd/silverbullet
- **License**: MIT License
- **Copyright**: Copyright (c) 2022 Zef Hemel
- **License Text**: [THIRD_PARTY_LICENSES/SILVERBULLET_LICENSE.txt](THIRD_PARTY_LICENSES/SILVERBULLET_LICENSE.txt)
- **Role in Mindora**:
  - Programmable knowledge and live query block conventions (`query` blocks).
  - Fast keyboard shortcuts and document command palette semantics.

---

## 5. AFFiNE / BlockSuite (Permissive Portions)
- **Origin**: https://github.com/toeverything/AFFiNE
- **License**: MIT (BlockSuite core libraries and packages)
- **Copyright**: Copyright (c) 2022-present TOEVERYTHING PTE. LTD. and its affiliates.
- **License Text**: [THIRD_PARTY_LICENSES/AFFINE_BLOCKSUITE_LICENSE.txt](THIRD_PARTY_LICENSES/AFFINE_BLOCKSUITE_LICENSE.txt)
- **Role in Mindora**:
  - Block state model and seamless dual-mode document/canvas conceptual architecture.

---

## 6. Studied Architectural References (Non-Included AGPL-3.0 Codebases)
The following codebases were cloned and reviewed exclusively for architectural study, benchmark comparison, and UX research. **No implementation code from these repositories is copied or bundled into the Mindora codebase**, preserving Mindora's clean MIT license:
- **AppFlowy & AppFlowy-Web** (AGPL-3.0, Copyright AppFlowy-IO)
- **Docmost** (AGPL-3.0, Copyright Docmost)
- **SiYuan** (AGPL-3.0, Copyright SiYuan Community)
- **Logseq** (AGPL-3.0, Copyright Logseq Inc.)

