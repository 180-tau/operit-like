import { Injectable, Logger } from '@nestjs/common';
import { Tool } from './tool.interface.js';
import { builtinTools } from './builtin-tools.js';

@Injectable()
export class ToolsService {
  private readonly logger = new Logger(ToolsService.name);
  private registry = new Map<string, Tool>();

  async onModuleInit(): Promise<void> {
    const tools = await builtinTools();
    for (const t of tools) this.registry.set(t.name, t);
    this.logger.log(`registered ${tools.length} built-in tools: ${tools.map((t) => t.name).join(', ')}`);
  }

  listTools(): Tool[] {
    return [...this.registry.values()];
  }

  toLLMDefs() {
    return this.listTools().map((t) => ({
      type: 'function' as const,
      function: { name: t.name, description: t.description, parameters: t.parameters },
    }));
  }

  async invoke(toolName: string, args: Record<string, unknown>) {
    const tool = this.registry.get(toolName);
    if (!tool) return { ok: false, error: `unknown tool: ${toolName}` };
    try {
      return await tool.execute(args ?? {});
    } catch (e) {
      this.logger.error(`tool ${toolName} failed`, e as Error);
      return { ok: false, error: String(e) };
    }
  }
}
