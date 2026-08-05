import { storage } from './storage';
import { aiService } from './ai';
import { graphService } from './graph';

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

export const MINDORA_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: 'mindora_search_notes',
    description: 'Perform semantic and keyword search across all documents in Mindora knowledge workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term or question' },
        topK: { type: 'number', description: 'Number of results to retrieve (default: 5)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'mindora_read_note',
    description: 'Retrieve the complete markdown content of a document by title or ID.',
    inputSchema: {
      type: 'object',
      properties: {
        titleOrId: { type: 'string', description: 'Title or pageId of the document' },
      },
      required: ['titleOrId'],
    },
  },
  {
    name: 'mindora_create_note',
    description: 'Create a new document in the active Mindora workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the note' },
        content: { type: 'string', description: 'Markdown body of the note' },
        parentId: { type: 'string', description: 'Optional parent note ID' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'mindora_update_note',
    description: 'Update the content or title of an existing document in Mindora.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Page ID to update' },
        content: { type: 'string', description: 'New markdown content' },
        title: { type: 'string', description: 'Optional updated title' },
      },
      required: ['id'],
    },
  },
  {
    name: 'mindora_query_database',
    description: 'Query records and properties from a relational database in Mindora.',
    inputSchema: {
      type: 'object',
      properties: {
        databaseId: { type: 'string', description: 'ID of the database' },
        filter: { type: 'string', description: 'Optional keyword filter' },
      },
      required: ['databaseId'],
    },
  },
  {
    name: 'mindora_get_graph',
    description: 'Retrieve the knowledge graph nodes, links, and backlinks for the workspace or a specific page.',
    inputSchema: {
      type: 'object',
      properties: {
        pageId: { type: 'string', description: 'Optional page ID to focus on' },
        radius: { type: 'number', description: 'Hop radius (0 for global, 1 for local)' },
      },
    },
  },
];

export class MCPBridgeService {
  public listTools(): MCPToolDefinition[] {
    return MINDORA_MCP_TOOLS;
  }

  public async executeTool(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'mindora_search_notes': {
        const query = args.query || '';
        const topK = args.topK || 5;
        const result = aiService.retrieveContext(query, topK);
        return {
          citations: result.citations,
          chunks: result.chunks.map((c) => ({
            title: c.pageTitle,
            heading: c.heading,
            score: c.score,
            text: c.text,
          })),
        };
      }

      case 'mindora_read_note': {
        const titleOrId = args.titleOrId;
        const page = storage.getPage(titleOrId) || storage.getPageByTitle(titleOrId);
        if (!page) {
          throw new Error(`Note not found matching "${titleOrId}"`);
        }
        return {
          id: page.id,
          title: page.title,
          content: page.content,
          tags: page.tags,
          updatedAt: page.updatedAt,
        };
      }

      case 'mindora_create_note': {
        const page = storage.createPage(args.title, args.content, args.parentId || null);
        return {
          status: 'created',
          id: page.id,
          title: page.title,
        };
      }

      case 'mindora_update_note': {
        const page = storage.updatePage(args.id, {
          content: args.content,
          title: args.title,
        });
        if (!page) throw new Error(`Note ${args.id} not found`);
        return { status: 'updated', id: page.id, title: page.title };
      }

      case 'mindora_query_database': {
        const records = storage.getRecords(args.databaseId);
        const filter = (args.filter || '').toLowerCase();
        const filtered = filter
          ? records.filter((r) =>
              r.title.toLowerCase().includes(filter) ||
              Object.values(r.properties).some((v) => String(v).toLowerCase().includes(filter))
            )
          : records;
        return { records: filtered };
      }

      case 'mindora_get_graph': {
        const graph = graphService.buildWorkspaceGraph(args.pageId, args.radius || 0);
        return graph;
      }

      default:
        throw new Error(`Unknown MCP tool "${toolName}"`);
    }
  }
}

export const mcpService = new MCPBridgeService();

