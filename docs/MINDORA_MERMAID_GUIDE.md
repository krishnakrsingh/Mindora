# Mindora Mermaid Diagram & Visual Architecture Guide

Mindora natively renders Mermaid diagrams both in markdown documents and inside the visual infinite canvas.

---

## 1. Supported Diagram Types

### Flowcharts (`flowchart TD` / `graph LR`)
```mermaid
graph TD
  User[Knowledge Worker] --> Editor[Block Editor]
  Editor --> Storage[Reactive Local Store]
  Storage --> AI[Semantic Retrieval Engine]
```

### Sequence Diagrams (`sequenceDiagram`)
```mermaid
sequenceDiagram
  Agent->>MCP Bridge: tools/call mindora_search_notes
  MCP Bridge->>Storage: Hybrid BM25 + Cosine Match
  Storage-->>MCP Bridge: Top K Grounded Chunks
  MCP Bridge-->>Agent: JSON Grounded Result
```

### Visual Whiteboard Canvas Integration
- Cards can be connected using directional bezier curve arrows.
- Anchor ports automatically calculate optimal curve tangents.
- Arrowhead markers maintain vector crispness across all zoom levels (40% to 200%).
