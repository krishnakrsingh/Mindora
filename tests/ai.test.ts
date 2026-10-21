import { describe, it, expect } from 'vitest';
import { aiService } from '../src/services/ai';
import { storage } from '../src/services/storage';

describe('AIService & Semantic Retrieval', () => {
  it('chunks workspace documents by headings', () => {
    const chunks = aiService.chunkWorkspace();
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.some((c) => c.pageTitle === 'AI Systems Architecture')).toBe(true);
    expect(chunks.every((c) => typeof c.heading === 'string' && typeof c.text === 'string')).toBe(true);
  });

  it('performs hybrid search and returns relevant chunks with citations', () => {
    const { chunks, citations } = aiService.retrieveContext('vector embeddings and retrieval pipeline');
    expect(chunks.length).toBeGreaterThan(0);
    expect(citations.length).toBeGreaterThan(0);

    expect(chunks.some((c) => c.pageTitle === 'AI Systems Architecture')).toBe(true);
    expect(chunks[0].score).toBeGreaterThan(0);
  });

  it('synthesizes grounded response with local offline engine when no key is set', async () => {
    const orig = storage.getAISettings();
    storage.updateAISettings({ apiKey: '' });
    try {
      const res = await aiService.queryWorkspace('Summarize the product roadmap');
      expect(res.text).toBeDefined();
      expect(res.text.length).toBeGreaterThan(30);
      expect(res.citations).toBeDefined();
    } finally {
      storage.updateAISettings(orig);
    }
  });
});
