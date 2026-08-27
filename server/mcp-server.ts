/**
 * Mindora Standalone Model Context Protocol (MCP) Stdio Server
 * Compatible with Claude Code, Cursor, Antigravity, and any JSON-RPC 2.0 MCP client.
 */

import { mcpService } from '../src/services/mcp';

export interface JSONRPCRequest {
  jsonrpc: string;
  id: string | number;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: string;
  id: string | number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export class MCPServer {
  public async handleMessage(rawMessage: string): Promise<JSONRPCResponse> {
    try {
      const request: JSONRPCRequest = JSON.parse(rawMessage);
      if (request.jsonrpc !== '2.0') {
        return {
          jsonrpc: '2.0',
          id: request.id || 0,
          error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
        };
      }

      switch (request.method) {
        case 'initialize':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              protocolVersion: '2024-11-05',
              capabilities: {
                tools: {},
                resources: {},
              },
              serverInfo: {
                name: 'mindora-mcp-server',
                version: '1.0.0',
              },
            },
          };

        case 'tools/list':
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              tools: mcpService.listTools(),
            },
          };

        case 'tools/call': {
          const { name, arguments: args } = request.params || {};
          const toolResult = await mcpService.executeTool(name, args || {});
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(toolResult, null, 2),
                },
              ],
            },
          };
        }

        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: { code: -32601, message: `Method not found: ${request.method}` },
          };
      }
    } catch (err: any) {
      console.error('MCP CAUGHT ERROR:', err);
      return {
        jsonrpc: '2.0',
        id: 0,
        error: { code: -32700, message: `Server error: ${err.message}` },
      };
    }
  }
}

export const mcpServer = new MCPServer();
