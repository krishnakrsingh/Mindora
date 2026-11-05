# Mindora Model Context Protocol (MCP) Integration Guide

Mindora exposes a standard Model Context Protocol (MCP) tool suite, enabling external AI agent environments (Claude Code, Cursor, Antigravity, and custom LLM runtimes) to search, read, write, and reason over your workspace.

---

## 1. Available Tools

### `mindora_search_notes`
- **Description**: Hybrid semantic vector + BM25 keyword search across workspace documents.
- **Parameters**:
  - `query` (string, required): Natural language search prompt.
  - `topK` (number, optional, default: 5): Maximum chunks to return.

### `mindora_read_note`
- **Description**: Retrieve full Markdown content and metadata for a specific note.
- **Parameters**:
  - `titleOrId` (string, required): Note title (e.g. `AI Systems Architecture`) or ID.

### `mindora_create_note`
- **Description**: Programmatically generate a new Markdown note in the workspace.
- **Parameters**:
  - `title` (string, required): Note title.
  - `content` (string, required): Markdown body.
  - `parentId` (string, optional): Parent folder/page ID.

### `mindora_update_note`
- **Description**: Update an existing note's Markdown content or propose diff changes.
- **Parameters**:
  - `id` (string, required): Note ID.
  - `content` (string, required): New Markdown content.

### `mindora_query_database`
- **Description**: Query and filter records from a relational database.
- **Parameters**:
  - `databaseId` (string, optional): Target database ID.
  - `filter` (string, optional): Search keyword.

### `mindora_get_graph`
- **Description**: Inspect workspace knowledge graph topology, backlinks, and degree centrality.
- **Parameters**:
  - None required.

---

## 2. Connecting via Claude Code or Cursor

Add the following to your `mcpServers` configuration (`claude_desktop_config.json` or `.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "mindora": {
      "command": "node",
      "args": ["dist-server/mcp-server.js"]
    }
  }
}
```

The server communicates over standard input/output (`stdio`) using JSON-RPC 2.0.
