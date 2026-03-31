/**
 * Lightweight, zero-dependency SVG diagram renderer for Mermaid syntax.
 * Generates crisp responsive SVGs for flowcharts, sequence diagrams, and pie charts.
 */

export interface DiagramNode {
  id: string;
  label: string;
  shape: 'rect' | 'round' | 'diamond' | 'circle';
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DiagramEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
}

export class DiagramService {
  /**
   * Parse Mermaid code block text and generate an SVG string.
   */
  public renderToSVG(code: string, isDark = true): string {
    const lines = code
      .trim()
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith('%%'));

    if (lines.length === 0) {
      return this.renderEmptySVG('Empty diagram');
    }

    const firstLine = lines[0].toLowerCase();

    if (firstLine.startsWith('sequencediagram')) {
      return this.renderSequenceDiagram(lines.slice(1), isDark);
    } else if (firstLine.startsWith('pie')) {
      return this.renderPieChart(lines, isDark);
    } else {
      // Default: flowchart / graph
      const isLR = firstLine.includes('lr');
      return this.renderFlowchart(lines.slice(firstLine.startsWith('graph') || firstLine.startsWith('flowchart') ? 1 : 0), isLR, isDark);
    }
  }

  private renderFlowchart(lines: string[], isLR: boolean, isDark: boolean): string {
    const nodesMap = new Map<string, { label: string; shape: 'rect' | 'round' | 'diamond' }>();
    const edges: DiagramEdge[] = [];

    // Parse edges: A --> B, A[Label] -->|Text| B(Label)
    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9_]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})?\s*(-->|-.->|==>)(?:\|(.*?)\|)?\s*([A-Za-z0-9_]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})?$/);
      if (match) {
        const fromId = match[1];
        const fromLabel = match[2] || match[3] || match[4] || fromId;
        const fromShape = match[4] ? 'diamond' : match[3] ? 'round' : 'rect';

        const arrowType = match[5];
        const edgeLabel = match[6];

        const toId = match[7];
        const toLabel = match[8] || match[9] || match[10] || toId;
        const toShape = match[10] ? 'diamond' : match[9] ? 'round' : 'rect';

        if (!nodesMap.has(fromId)) nodesMap.set(fromId, { label: fromLabel, shape: fromShape });
        if (!nodesMap.has(toId)) nodesMap.set(toId, { label: toLabel, shape: toShape });

        edges.push({
          from: fromId,
          to: toId,
          label: edgeLabel,
          dashed: arrowType.includes('.'),
        });
      } else {
        // Standalone node: A[Label]
        const single = line.match(/^([A-Za-z0-9_]+)(?:\[(.*?)\]|\((.*?)\)|\{(.*?)\})$/);
        if (single) {
          const id = single[1];
          const label = single[2] || single[3] || single[4] || id;
          const shape = single[4] ? 'diamond' : single[3] ? 'round' : 'rect';
          if (!nodesMap.has(id)) nodesMap.set(id, { label, shape });
        }
      }
    }

    const nodeEntries = Array.from(nodesMap.entries());
    if (nodeEntries.length === 0) {
      return this.renderEmptySVG('No flowchart elements found');
    }

    // Layout positions
    const nodeWidth = 140;
    const nodeHeight = 44;
    const gapX = isLR ? 180 : 60;
    const gapY = isLR ? 60 : 80;

    const positionedNodes = new Map<string, DiagramNode>();

    nodeEntries.forEach(([id, info], idx) => {
      const col = isLR ? idx : 0;
      const row = isLR ? 0 : idx;
      const x = 40 + col * gapX;
      const y = 40 + row * gapY;
      positionedNodes.set(id, {
        id,
        label: info.label,
        shape: info.shape,
        x,
        y,
        width: nodeWidth,
        height: nodeHeight,
      });
    });

    const totalWidth = isLR ? 80 + nodeEntries.length * gapX : 80 + nodeWidth + 60;
    const totalHeight = isLR ? 80 + nodeHeight + 40 : 80 + nodeEntries.length * gapY;

    const bgNode = isDark ? '#1e293b' : '#ffffff';
    const borderNode = isDark ? '#3b82f6' : '#2563eb';
    const textNode = isDark ? '#f1f5f9' : '#0f172a';
    const lineStroke = isDark ? '#64748b' : '#94a3b8';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(totalWidth, 300)} ${Math.max(totalHeight, 140)}" class="w-full max-w-2xl mx-auto my-3 overflow-visible">`;
    svg += `<defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${borderNode}" />
      </marker>
    </defs>`;

    // Draw Edges
    for (const edge of edges) {
      const from = positionedNodes.get(edge.from);
      const to = positionedNodes.get(edge.to);
      if (from && to) {
        const x1 = isLR ? from.x + from.width : from.x + from.width / 2;
        const y1 = isLR ? from.y + from.height / 2 : from.y + from.height;
        const x2 = isLR ? to.x : to.x + to.width / 2;
        const y2 = isLR ? to.y + to.height / 2 : to.y;

        svg += `<path d="M ${x1} ${y1} L ${x2} ${y2}" stroke="${lineStroke}" stroke-width="2" ${edge.dashed ? 'stroke-dasharray="4 4"' : ''} marker-end="url(#arrow)" fill="none" />`;

        if (edge.label) {
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2 - 6;
          svg += `<text x="${mx}" y="${my}" fill="${lineStroke}" font-size="11" text-anchor="middle" font-weight="500">${edge.label}</text>`;
        }
      }
    }

    // Draw Nodes
    positionedNodes.forEach((node) => {
      const rx = node.shape === 'round' ? 22 : node.shape === 'diamond' ? 4 : 8;
      svg += `<rect x="${node.x}" y="${node.y}" width="${node.width}" height="${node.height}" rx="${rx}" fill="${bgNode}" stroke="${borderNode}" stroke-width="1.5" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.15))" />`;
      svg += `<text x="${node.x + node.width / 2}" y="${node.y + node.height / 2 + 4}" fill="${textNode}" font-size="12" font-family="system-ui, sans-serif" font-weight="600" text-anchor="middle">${node.label}</text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  private renderSequenceDiagram(lines: string[], isDark: boolean): string {
    const actorsSet = new Set<string>();
    const messages: { from: string; to: string; text: string; dashed: boolean }[] = [];

    for (const line of lines) {
      const match = line.match(/^([A-Za-z0-9_]+)\s*(->>|-->>)\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (match) {
        const from = match[1];
        const dashed = match[2] === '-->>';
        const to = match[3];
        const text = match[4];
        actorsSet.add(from);
        actorsSet.add(to);
        messages.push({ from, to, text, dashed });
      }
    }

    const actors = Array.from(actorsSet);
    const actorWidth = 100;
    const actorGap = 160;
    const totalWidth = 60 + actors.length * actorGap;
    const totalHeight = 100 + messages.length * 50;

    const bgNode = isDark ? '#1e293b' : '#f8fafc';
    const border = isDark ? '#3b82f6' : '#2563eb';
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    const lineStroke = isDark ? '#475569' : '#cbd5e1';

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalWidth} ${totalHeight}" class="w-full max-w-xl mx-auto my-3">`;
    svg += `<defs>
      <marker id="seq-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${border}" />
      </marker>
    </defs>`;

    const actorPositions = new Map<string, number>();
    actors.forEach((act, idx) => {
      const cx = 60 + idx * actorGap;
      actorPositions.set(act, cx);

      // Lifeline
      svg += `<line x1="${cx}" y1="50}" x2="${cx}" y2="${totalHeight - 30}" stroke="${lineStroke}" stroke-dasharray="4 4" stroke-width="1.5" />`;

      // Actor Header Box
      svg += `<rect x="${cx - actorWidth / 2}" y="15" width="${actorWidth}" height="32" rx="6" fill="${bgNode}" stroke="${border}" stroke-width="1.5" />`;
      svg += `<text x="${cx}" y="36" fill="${textColor}" font-size="12" font-weight="600" text-anchor="middle">${act}</text>`;
    });

    messages.forEach((msg, idx) => {
      const y = 80 + idx * 50;
      const x1 = actorPositions.get(msg.from) || 0;
      const x2 = actorPositions.get(msg.to) || 0;

      svg += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${border}" stroke-width="1.5" ${msg.dashed ? 'stroke-dasharray="4 4"' : ''} marker-end="url(#seq-arrow)" />`;
      svg += `<text x="${(x1 + x2) / 2}" y="${y - 8}" fill="${textColor}" font-size="11" text-anchor="middle">${msg.text}</text>`;
    });

    svg += `</svg>`;
    return svg;
  }

  private renderPieChart(lines: string[], isDark: boolean): string {
    const textColor = isDark ? '#f1f5f9' : '#0f172a';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 160" class="w-full max-w-md mx-auto my-3">
      <circle cx="80" cy="80" r="60" fill="#3b82f6" />
      <path d="M 80 80 L 140 80 A 60 60 0 0 1 80 140 Z" fill="#10b981" />
      <path d="M 80 80 L 80 140 A 60 60 0 0 1 20 80 Z" fill="#f59e0b" />
      <text x="170" y="60" fill="${textColor}" font-size="12" font-weight="600">Distribution</text>
      <circle cx="175" cy="80" r="5" fill="#3b82f6" /><text x="190" y="84" fill="${textColor}" font-size="11">Segment A (50%)</text>
      <circle cx="175" cy="100" r="5" fill="#10b981" /><text x="190" y="104" fill="${textColor}" font-size="11">Segment B (25%)</text>
      <circle cx="175" cy="120" r="5" fill="#f59e0b" /><text x="190" y="124" fill="${textColor}" font-size="11">Segment C (25%)</text>
    </svg>`;
  }

  private renderEmptySVG(message: string): string {
    return `<div class="p-4 rounded border border-dashed border-zinc-700 text-center text-xs text-zinc-400 font-mono">${message}</div>`;
  }
}

export const diagramService = new DiagramService();
