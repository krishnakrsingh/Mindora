import { describe, it, expect } from 'vitest';
import { mcpServer } from '../server/mcp-server';

describe('MCPServer JSON-RPC 2.0 Protocol', () => {
  it('handles initialize handshake request with server capabilities', async () => {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'initialize',
    });
    const res = await mcpServer.handleMessage(req);
    expect(res.jsonrpc).toBe('2.0');
    expect(res.id).toBe(1);
    expect(res.result.serverInfo.name).toBe('mindora-mcp-server');
  });

  it('lists registered MCP tools on tools/list request', async () => {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    const res = await mcpServer.handleMessage(req);
    expect(res.result.tools).toBeDefined();
    expect(res.result.tools.length).toBeGreaterThan(3);
    expect(res.result.tools.some((t: any) => t.name === 'mindora_search_notes')).toBe(true);
  });

  it('dispatches tool calls on tools/call request', async () => {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'mindora_search_notes',
        arguments: { query: 'Architecture' },
      },
    });
    const res = await mcpServer.handleMessage(req);
    expect(res.result.content[0].type).toBe('text');
    expect(res.result.content[0].text).toContain('citations');
  });

  it('returns standard JSON-RPC 2.0 error for unknown methods', async () => {
    const req = JSON.stringify({
      jsonrpc: '2.0',
      id: 99,
      method: 'unknown/method',
    });
    const res = await mcpServer.handleMessage(req);
    expect(res.error).toBeDefined();
    expect(res.error?.code).toBe(-32601);
  });
});
