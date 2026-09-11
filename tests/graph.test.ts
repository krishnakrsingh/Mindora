import { describe, it, expect } from 'vitest';
import { graphService } from '../src/services/graph';
import { storage } from '../src/services/storage';

describe('GraphService', () => {
  it('extracts nodes and links from workspace pages', () => {
    const graph = graphService.buildWorkspaceGraph();
    expect(graph.nodes.length).toBeGreaterThan(0);
    expect(graph.links.length).toBeGreaterThan(0);

    const welcomeNode = graph.nodes.find((n) => n.title === 'Welcome to Mindora');
    expect(welcomeNode).toBeDefined();
    expect(welcomeNode?.degree).toBeGreaterThan(0);
  });

  it('retrieves backlinks for specific page', () => {
    const pages = storage.getPages();
    const aiArchPage = pages.find((p) => p.title === 'AI Systems Architecture');
    expect(aiArchPage).toBeDefined();

    if (aiArchPage) {
      const backlinks = graphService.getBacklinks(aiArchPage.id);
      expect(backlinks.length).toBeGreaterThan(0);
      expect(backlinks.some((b) => b.title === 'Welcome to Mindora')).toBe(true);
    }
  });

  it('filters local neighborhood 1-hop graph around target page', () => {
    const pages = storage.getPages();
    const welcome = pages.find((p) => p.title === 'Welcome to Mindora');
    expect(welcome).toBeDefined();

    if (welcome) {
      const localGraph = graphService.buildWorkspaceGraph(welcome.id, 1);
      expect(localGraph.nodes.length).toBeGreaterThan(1);
      expect(localGraph.nodes.some((n) => n.id === welcome.id)).toBe(true);
    }
  });
});

