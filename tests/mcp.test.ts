import { describe, it, expect } from 'vitest';
import { mcpService, MINDORA_MCP_TOOLS } from '../src/services/mcp';

describe('MCPBridgeService', () => {
  it('exposes standard tool definitions', () => {
    const tools = mcpService.listTools();
    expect(tools.length).toBeGreaterThanOrEqual(5);
    expect(tools.some((t) => t.name === 'mindora_search_notes')).toBe(true);
    expect(tools.some((t) => t.name === 'mindora_read_note')).toBe(true);
    expect(tools.some((t) => t.name === 'mindora_query_database')).toBe(true);
  });

  it('executes mindora_search_notes tool', async () => {
    const result = await mcpService.executeTool('mindora_search_notes', { query: 'knowledge' });
    expect(result).toBeDefined();
    expect(Array.isArray(result.citations)).toBe(true);
    expect(Array.isArray(result.chunks)).toBe(true);
  });

  it('executes mindora_read_note tool', async () => {
    const result = await mcpService.executeTool('mindora_read_note', { titleOrId: 'Welcome to Mindora' });
    expect(result).toBeDefined();
    expect(result.title).toBe('Welcome to Mindora');
    expect(result.content).toContain('Welcome to Mindora');
  });

  it('executes mindora_get_graph tool', async () => {
    const result = await mcpService.executeTool('mindora_get_graph', {});
    expect(result.nodes).toBeDefined();
    expect(result.links).toBeDefined();
    expect(result.nodes.length).toBeGreaterThan(0);
  });
});
