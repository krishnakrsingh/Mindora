# Mindora AI Architecture & Semantic Knowledge Engine

## 1. Architectural Philosophy

In Mindora, AI is not a generic floating chatbot; it is deeply embedded in the workspace information architecture. It understands:
- The structure of the workspace (hierarchies, databases, tags).
- The exact relationships between documents (Wikilinks, backlinks, and graph clusters).
- The full content of documents via high-speed semantic retrieval and keyword matching.

---

## 2. The Retrieval & Synthesis Pipeline

```text
User Query / Task
       |
       v
+-----------------------------+
| Hybrid Search Controller    |
+-----------------------------+
       |                     |
       v                     v
[Vector Similarity]   [BM25 / Full-Text]
(Semantic Embeddings) (Exact Term Matching)
       \                     /
        \                   /
         v                 v
   +-----------------------------+
   | Reciprocal Rank Fusion      |
   +-----------------------------+
                 |
                 v
   +-----------------------------+
   | Context Assembly & Citations|
   +-----------------------------+
                 |
                 v
   +-----------------------------+
   | Multi-Provider LLM Gateway  |
   | (Gemini / Claude / OpenAI / |
   |  Ollama / OpenRouter)       |
   +-----------------------------+
                 |
                 v
       Grounded Response with 
     Clickable Workspace Citations
```

---

## 3. Multi-Provider LLM Gateway

Mindora features provider independence:
- **Google Gemini**: Modern `gemini-2.5` / `gemini-1.5-flash` API with low latency and high context windows.
- **Anthropic Claude**: `claude-3-5-sonnet` / `claude-3-haiku` via direct API.
- **OpenAI**: `gpt-4o`, `gpt-4o-mini`, `o1`.
- **Ollama**: 100% private local inference (e.g., `llama3.2`, `mistral`, `qwen2.5`) with zero cloud data transmission.
- **OpenRouter**: Unified API for hundreds of open and closed models.

---

## 4. Grounded Synthesis & Source Attribution

Every synthesis response attributes claims to actual document chunks:
```typescript
interface Citation {
  pageId: string;
  pageTitle: string;
  chunkSnippet: string;
  relevanceScore: number;
}
```
Users can click any citation pill in the AI panel to immediately navigate to the exact source note.

---

## 5. Inline AI Writing Assistant
The editor allows users to invoke AI directly on active text selections:
- **Improve Writing**: Enhances tone, conciseness, and precision.
- **Summarize**: Produces concise bullet points.
- **Generate Outline**: Outlines topics into structured headings.
- **Extract Tasks**: Identifies action items and outputs `- [ ]` checkboxes.
- **Explain**: Clarifies complex concepts in context.
- **Diff Preview**: Provides interactive Side-by-Side or unified diff preview before accepting modifications.

