import { describe, it, expect } from 'vitest';
import { diagramService } from '../src/services/diagram';

describe('DiagramService Mermaid SVG Engine', () => {
  it('renders flowchart graph into valid SVG with nodes and arrows', () => {
    const code = `
    graph TD
      A[Client App] --> B[API Gateway]
      B --> C[PostgreSQL]
    `;
    const svg = diagramService.renderToSVG(code, true);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Client App');
    expect(svg).toContain('API Gateway');
    expect(svg).toContain('PostgreSQL');
    expect(svg).toContain('marker-end="url(#arrow)"');
  });

  it('renders sequence diagrams with actor lifelines and directional messages', () => {
    const code = `
    sequenceDiagram
      Alice->>Bob: Hello Bob
      Bob-->>Alice: Hi Alice
    `;
    const svg = diagramService.renderToSVG(code, true);
    expect(svg).toContain('<svg');
    expect(svg).toContain('Alice');
    expect(svg).toContain('Bob');
    expect(svg).toContain('Hello Bob');
    expect(svg).toContain('Hi Alice');
  });

  it('handles empty diagrams safely without runtime exceptions', () => {
    const svg = diagramService.renderToSVG('', true);
    expect(svg).toBeDefined();
    expect(svg).toContain('Empty diagram');
  });
});
