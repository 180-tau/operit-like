// Tool definition & invocation protocol (OpenAI function-call compatible JSON Schema).

/** Parameter schema — OpenAI JSON Schema subset used for function calling. */
export interface ToolParameterSchema {
  type: 'string' | 'number' | 'boolean' | 'integer' | 'object' | 'array' | 'null';
  description?: string;
  enum?: string[];
  properties?: Record<string, ToolParameterSchema>;
  items?: ToolParameterSchema;
  required?: string[];
  additionalProperties?: boolean;
  default?: unknown;
}

/** A tool that can be called by the agent runtime. */
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  /** Permission domain, enforced at runtime. */
  permission?: ToolPermission;
}

export type ToolPermission =
  | 'none'
  | 'file.read'
  | 'file.write'
  | 'network'
  | 'terminal'
  | 'system'
  | 'device';

/** Result of a tool invocation. */
export interface ToolResult {
  ok: boolean;
  data?: unknown;
  error?: string;
  /** Optional artifacts (files, images…) referenced by path/URL. */
  attachments?: ToolAttachment[];
}

export interface ToolAttachment {
  type: 'file' | 'image' | 'audio' | 'url';
  url?: string;
  path?: string;
  mime?: string;
}

/** Invocation record — for audit & replay. */
export interface ToolInvocation {
  id: string;
  conversationId: string;
  toolName: string;
  input: unknown;
  output: ToolResult;
  startedAt: string;
  finishedAt: string;
  costTokens?: number;
}
