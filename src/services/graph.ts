import { GraphData, GraphNode, GraphLink } from '../types';
import { storage } from './storage';

export class GraphService {
  public buildWorkspaceGraph(activePageId?: string, localRadius = 0): GraphData {
    const pages = storage.getPages();
    const databases = storage.getDatabases();

    const nodesMap = new Map<string, GraphNode>();
    const links: GraphLink[] = [];

    // 1. Add all pages as primary nodes
    for (const page of pages) {
      nodesMap.set(page.id, {
        id: page.id,
        title: page.title,
        type: 'page',
        degree: 0,
        tags: page.tags,
        excerpt: page.content.slice(0, 100).replace(/[#*`\n]/g, ' '),
      });
    }

    // 2. Add databases as nodes
    for (const db of databases) {
      nodesMap.set(db.id, {
        id: db.id,
        title: db.title,
        type: 'database',
        degree: 0,
        excerpt: db.description || 'Relational database',
      });
    }

    // 3. Extract Wikilinks (`[[Page Title]]`) and build links
    const titleToId = new Map<string, string>();
    for (const page of pages) {
      titleToId.set(page.title.toLowerCase().trim(), page.id);
    }

    for (const page of pages) {
      const wikilinkRegex = /\[\[(.*?)\]\]/g;
      let match: RegExpExecArray | null;

      while ((match = wikilinkRegex.exec(page.content)) !== null) {
        const rawTarget = match[1].split('|')[0].trim();
        const targetId = titleToId.get(rawTarget.toLowerCase());

        if (targetId && targetId !== page.id) {
          links.push({
            source: page.id,
            target: targetId,
            type: 'wikilink',
          });

          // Increment degrees
          const sourceNode = nodesMap.get(page.id);
          const targetNode = nodesMap.get(targetId);
          if (sourceNode) sourceNode.degree += 1;
          if (targetNode) targetNode.degree += 1;
        }
      }

      // Hierarchy link if parent page exists
      if (page.parentId && nodesMap.has(page.parentId)) {
        links.push({
          source: page.parentId,
          target: page.id,
          type: 'hierarchy',
        });
        const parentNode = nodesMap.get(page.parentId);
        const childNode = nodesMap.get(page.id);
        if (parentNode) parentNode.degree += 1;
        if (childNode) childNode.degree += 1;
      }
    }

    // Filter for local neighborhood graph if activePageId and localRadius > 0
    if (activePageId && localRadius > 0 && nodesMap.has(activePageId)) {
      const allowedNodeIds = new Set<string>([activePageId]);

      // 1-hop
      for (const link of links) {
        if (link.source === activePageId) allowedNodeIds.add(link.target);
        if (link.target === activePageId) allowedNodeIds.add(link.source);
      }

      // 2-hop if requested
      if (localRadius > 1) {
        const hop1 = Array.from(allowedNodeIds);
        for (const hId of hop1) {
          for (const link of links) {
            if (link.source === hId) allowedNodeIds.add(link.target);
            if (link.target === hId) allowedNodeIds.add(link.source);
          }
        }
      }

      const filteredNodes = Array.from(nodesMap.values()).filter((n) => allowedNodeIds.has(n.id));
      const filteredLinks = links.filter(
        (l) => allowedNodeIds.has(l.source) && allowedNodeIds.has(l.target)
      );

      return { nodes: filteredNodes, links: filteredLinks };
    }

    return {
      nodes: Array.from(nodesMap.values()),
      links,
    };
  }

  // Identifies backlinks for a specific page
  public getBacklinks(pageId: string): { id: string; title: string; excerpt: string }[] {
    const pages = storage.getPages();
    const targetPage = pages.find((p) => p.id === pageId);
    if (!targetPage) return [];

    const targetTitle = targetPage.title.toLowerCase();
    const backlinks: { id: string; title: string; excerpt: string }[] = [];

    for (const page of pages) {
      if (page.id === pageId) continue;
      const regex = new RegExp(`\\[\\[${targetTitle}\\]\\]`, 'i');
      if (regex.test(page.content)) {
        const idx = page.content.search(regex);
        const start = Math.max(0, idx - 40);
        const excerpt = '...' + page.content.slice(start, idx + 60).replace(/\n/g, ' ') + '...';
        backlinks.push({
          id: page.id,
          title: page.title,
          excerpt,
        });
      }
    }

    return backlinks;
  }
}

export const graphService = new GraphService();

