export type ViewMode = 'doc' | 'base' | 'graph' | 'canvas' | 'chat';

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceData {
  version: string;
  workspace?: Workspace;
  workspaces?: Workspace[];
  pages: Page[];
  databases: Database[];
  records: DatabaseRecord[];
  canvases?: CanvasBoard[];
}

export interface Page {
  id: string;
  workspaceId: string;
  title: string;
  content: string; // Canonical Markdown representation
  icon?: string;
  coverImage?: string;
  parentId?: string | null;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}

export type PropertyType = 
  | 'text' 
  | 'number' 
  | 'select' 
  | 'multi-select' 
  | 'status' 
  | 'date' 
  | 'checkbox' 
  | 'url' 
  | 'email'
  | 'formula'
  | 'rollup'
  | 'relation';

export interface SelectOption {
  id: string;
  name: string;
  color: string;
}

export type RollupFunction = 'sum' | 'avg' | 'min' | 'max' | 'count' | 'count_unique' | 'percent_checked';

export interface RollupConfig {
  relationPropertyId: string;
  targetPropertyId: string;
  function: RollupFunction;
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[];
  formulaExpression?: string;
  rollupConfig?: RollupConfig;
  targetDatabaseId?: string;
}

export interface DatabaseRecord {
  id: string;
  databaseId: string;
  title: string;
  properties: Record<string, any>;
  pageId?: string; // Optional linked page
  createdAt: number;
  updatedAt: number;
}

export type BaseViewType = 'table' | 'board' | 'list' | 'gallery';

export interface BaseView {
  id: string;
  name: string;
  type: BaseViewType;
  groupByProperty?: string;
  filterProperty?: string;
  filterValue?: string;
  sortProperty?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface Database {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  icon?: string;
  properties: DatabaseProperty[];
  views: BaseView[];
  activeViewId: string;
  createdAt: number;
  updatedAt: number;
}

export type CanvasNodeType = 'page' | 'sticky' | 'card' | 'group';

export interface CanvasNode {
  id: string;
  boardId: string;
  type: CanvasNodeType;
  title: string;
  content?: string;
  pageId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
}

export interface CanvasEdge {
  id: string;
  boardId: string;
  fromId: string;
  toId: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface CanvasBoard {
  id: string;
  workspaceId: string;
  title: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  createdAt: number;
  updatedAt: number;
}

export interface GraphNode {
  id: string;
  title: string;
  type: 'page' | 'tag' | 'database';
  degree: number;
  tags?: string[];
  excerpt?: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: 'wikilink' | 'tag' | 'hierarchy';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export type LLMProvider = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'openrouter';

export interface AISettings {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  baseUrl?: string; // for custom Ollama / OpenRouter
}

export interface AICitation {
  pageId: string;
  pageTitle: string;
  excerpt: string;
  score: number;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: AICitation[];
  proposedChange?: {
    pageId: string;
    originalText: string;
    proposedText: string;
  };
  timestamp: number;
}

export interface AIConversation {
  id: string;
  workspaceId: string;
  title: string;
  messages: AIMessage[];
  createdAt: number;
  updatedAt: number;
}

