import { Page, AISettings, AICitation, AIMessage } from '../types';
import { storage } from './storage';

export interface RetrievalChunk {
  pageId: string;
  pageTitle: string;
  heading: string;
  text: string;
  score?: number;
}

// Tokenizes text for BM25-style lexical scoring
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

// Simple deterministic hash-vector embedding for fast client-side cosine similarity
function computeEmbedding(text: string, dimensions = 64): number[] {
  const vec = new Array(dimensions).fill(0);
  const tokens = tokenize(text);
  if (tokens.length === 0) return vec;

  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash << 5) - hash + token.charCodeAt(i);
      hash |= 0;
    }
    const idx = Math.abs(hash) % dimensions;
    vec[idx] += 1;
  }

  // Normalize
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < dimensions; i++) {
      vec[i] /= magnitude;
    }
  }
  return vec;
}

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
  }
  return dot;
}

export class AIService {
  // Chunks all pages in the current workspace into semantic sections
  public chunkWorkspace(): RetrievalChunk[] {
    const pages = storage.getPages();
    const chunks: RetrievalChunk[] = [];

    for (const page of pages) {
      if (!page.content || page.content.trim().length === 0) continue;

      const lines = page.content.split(/\r?\n/);
      let currentHeading = page.title;
      let currentSection: string[] = [];

      for (const line of lines) {
        if (line.startsWith('#')) {
          if (currentSection.length > 0) {
            chunks.push({
              pageId: page.id,
              pageTitle: page.title,
              heading: currentHeading,
              text: currentSection.join('\n').trim(),
            });
            currentSection = [];
          }
          currentHeading = line.replace(/^#+\s*/, '').trim();
        } else {
          currentSection.push(line);
        }
      }

      if (currentSection.length > 0) {
        chunks.push({
          pageId: page.id,
          pageTitle: page.title,
          heading: currentHeading,
          text: currentSection.join('\n').trim(),
        });
      }
    }

    return chunks;
  }

  // Hybrid search combining lexical overlap with vector cosine similarity
  public retrieveContext(query: string, topK = 4): { chunks: RetrievalChunk[]; citations: AICitation[] } {
    const allChunks = this.chunkWorkspace();
    if (allChunks.length === 0) {
      return { chunks: [], citations: [] };
    }

    const queryTokens = new Set(tokenize(query));
    const queryVec = computeEmbedding(query);

    const scored = allChunks.map((chunk) => {
      // 1. Lexical BM25 approximation
      const chunkTokens = tokenize(chunk.text + ' ' + chunk.heading + ' ' + chunk.pageTitle);
      let lexicalMatch = 0;
      for (const t of chunkTokens) {
        if (queryTokens.has(t)) lexicalMatch++;
      }
      const lexicalScore = chunkTokens.length > 0 ? lexicalMatch / Math.sqrt(chunkTokens.length) : 0;

      // 2. Vector cosine similarity
      const chunkVec = computeEmbedding(chunk.text + ' ' + chunk.heading);
      const vectorScore = cosineSimilarity(queryVec, chunkVec);

      // Hybrid rank fusion
      const hybridScore = lexicalScore * 0.45 + vectorScore * 0.55;

      return {
        ...chunk,
        score: hybridScore,
      };
    });

    // Sort descending by relevance score
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));
    const topChunks = scored.slice(0, topK).filter((c) => (c.score || 0) > 0.05);

    const citations: AICitation[] = topChunks.map((c) => ({
      pageId: c.pageId,
      pageTitle: c.pageTitle,
      excerpt: c.text.slice(0, 140) + (c.text.length > 140 ? '...' : ''),
      score: Math.round((c.score || 0) * 100),
    }));

    return { chunks: topChunks, citations };
  }

  // Main chat synthesis
  public async queryWorkspace(
    userPrompt: string,
    activePage?: Page
  ): Promise<{ text: string; citations: AICitation[] }> {
    const settings = storage.getAISettings();
    const { chunks, citations } = this.retrieveContext(userPrompt);

    // Build grounded context
    let contextStr = '';
    if (chunks.length > 0) {
      contextStr = chunks
        .map((c, i) => `[Source ${i + 1}: ${c.pageTitle} > ${c.heading}]\n${c.text}`)
        .join('\n\n---\n\n');
    }

    if (activePage && !chunks.some((c) => c.pageId === activePage.id)) {
      contextStr += `\n\n[Active Document: ${activePage.title}]\n${activePage.content.slice(0, 2000)}`;
    }

    const systemPrompt = `You are Mindora AI, the intelligence core of Mindora knowledge workspace.
Answer the user's question with precision, clarity, and deep understanding of their workspace.
Ground your response strictly in the provided Workspace Context where relevant.
When referencing concepts from documents, cite them explicitly like [[Page Title]].
If the information is not in the workspace, you may supplement with general knowledge, but clearly distinguish it.

WORKSPACE CONTEXT:
${contextStr || '(No matching workspace documents found for this query)'}
`;

    // Attempt real API call if key is configured
    if (settings.apiKey && settings.apiKey.trim().length > 0) {
      try {
        if (settings.provider === 'gemini') {
          return await this.callGemini(settings, systemPrompt, userPrompt, citations);
        } else if (settings.provider === 'openai') {
          return await this.callOpenAI(settings, systemPrompt, userPrompt, citations);
        } else if (settings.provider === 'anthropic') {
          return await this.callAnthropic(settings, systemPrompt, userPrompt, citations);
        }
      } catch (err: any) {
        console.warn('Real AI provider call failed, falling back to local synthesis engine:', err);
      }
    }

    // Local Grounded Synthesis Engine (runs zero-cloud, 100% offline)
    const localResponse = this.synthesizeLocally(userPrompt, chunks, activePage);
    return {
      text: localResponse,
      citations,
    };
  }

  // Local synthesis engine for offline/fallback mode
  private synthesizeLocally(prompt: string, chunks: RetrievalChunk[], activePage?: Page): string {
    const promptLower = prompt.toLowerCase();

    if (chunks.length === 0 && !activePage) {
      return `I analyzed your workspace, but didn't find notes directly addressing "${prompt}". 

You can create a note about this using the **+** button in the sidebar or ask me to draft an initial document outline for you!`;
    }

    if (promptLower.includes('summarize') || promptLower.includes('summary')) {
      const top = chunks[0] || (activePage ? { pageTitle: activePage.title, text: activePage.content } : null);
      if (top) {
        return `### Workspace Summary: [[${top.pageTitle}]]

Based on your retrieved documents, here is the synthesis:

- **Primary Theme**: ${top.text.split('\n')[0] || top.pageTitle}
- **Key Extract**: "${top.text.slice(0, 260).replace(/[#*`]/g, '')}..."
- **Connections**: This document forms part of your broader knowledge graph and links with other concepts in your workspace.

*(Grounded in ${chunks.length} workspace source${chunks.length > 1 ? 's' : ''})*`;
      }
    }

    const sourceTitles = Array.from(new Set(chunks.map((c) => c.pageTitle)));
    const highlights = chunks.slice(0, 3).map((c) => `- From [[${c.pageTitle}]]: "${c.text.slice(0, 160).replace(/[#*`\n]/g, ' ')}..."`).join('\n');

    return `Based on your workspace notes (${sourceTitles.map((t) => `[[${t}]]`).join(', ')}):

${highlights}

### Synthesis & Next Actions
Mindora's semantic index identified these connections directly from your active knowledge base. You can explore how these interact visually in the **Knowledge Graph** or deepen the writing in the **Block Editor**.

*(To enable real-time cloud LLM generation via Gemini, Claude, or OpenAI, enter your API key in Workspace Settings).*`;
  }

  // Provider: Google Gemini
  private async callGemini(
    settings: AISettings,
    systemPrompt: string,
    userPrompt: string,
    citations: AICitation[]
  ): Promise<{ text: string; citations: AICitation[] }> {
    const model = settings.model || 'gemini-3.6-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.apiKey}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: settings.temperature,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return { text, citations };
  }

  // Provider: OpenAI
  private async callOpenAI(
    settings: AISettings,
    systemPrompt: string,
    userPrompt: string,
    citations: AICitation[]
  ): Promise<{ text: string; citations: AICitation[] }> {
    const url = 'https://api.openai.com/v1/chat/completions';
    const model = settings.model || 'gpt-4o-mini';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${settings.apiKey}`,
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: settings.temperature,
      }),
    });

    if (!res.ok) {
      throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content || 'No response generated.';
    return { text, citations };
  }

  // Provider: Anthropic Claude
  private async callAnthropic(
    settings: AISettings,
    systemPrompt: string,
    userPrompt: string,
    citations: AICitation[]
  ): Promise<{ text: string; citations: AICitation[] }> {
    const url = 'https://api.anthropic.com/v1/messages';
    const model = settings.model || 'claude-3-5-sonnet-20241022';

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': settings.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        max_tokens: 2048,
        temperature: settings.temperature,
      }),
    });

    if (!res.ok) {
      throw new Error(`Anthropic API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const text = data?.content?.[0]?.text || 'No response generated.';
    return { text, citations };
  }

  // Inline AI action helper
  public async executeInlineAction(
    action: 'improve' | 'summarize' | 'outline' | 'tasks' | 'explain',
    selectedText: string
  ): Promise<string> {
    const actionPrompts = {
      improve: 'Improve the writing clarity, flow, and elegance of this text while preserving its exact meaning:',
      summarize: 'Provide a concise, punchy bulleted summary of this text:',
      outline: 'Convert this text or topic into a structured hierarchical outline with markdown headings:',
      tasks: 'Extract all actionable tasks, deliverables, and todos from this text as markdown checkboxes (- [ ]):',
      explain: 'Explain the core principles and implications of this text simply and insightfully:',
    };

    const prompt = `${actionPrompts[action]}\n\n"""\n${selectedText}\n"""`;
    const res = await this.queryWorkspace(prompt);
    return res.text;
  }
}

export const aiService = new AIService();

