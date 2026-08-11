import { ToolParameterSchema } from '@operit/shared';

export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  permission: 'none' | 'file.read' | 'file.write' | 'network' | 'terminal';
  execute(args: Record<string, unknown>): Promise<{ ok: boolean; data?: unknown; error?: string }>;
}

export interface ToolInvocationInput {
  toolName: string;
  args: Record<string, unknown>;
  userId: string;
}

export interface ToolInvocationResult {
  ok: boolean;
  data?: unknown;
  error?: string;
}
