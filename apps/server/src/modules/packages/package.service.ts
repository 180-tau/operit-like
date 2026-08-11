import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ToolsService } from '../tools/tools.service.js';

export interface PackageInfo {
  name: string;
  version: string;
  description: string;
  permissions: string[];
  tools: string[];
  enabled: boolean;
  builtin: boolean;
}

@Injectable()
export class PackageService {
  private readonly logger = new Logger(PackageService.name);
  private readonly packages = new Map<string, PackageInfo>();

  constructor(private readonly tools: ToolsService) {}

  /** Register builtin packages after ToolsService has initialized its registry. */
  onModuleInit(): void {
    const toolNames = this.tools.listTools().map((t) => t.name);
    this.packages.set('core', {
      name: 'core',
      version: '0.1.0',
      description: 'Core built-in tools: time, http, file, code execution.',
      permissions: ['file', 'network', 'terminal'],
      tools: toolNames,
      enabled: true,
      builtin: true,
    });
    this.logger.log(`package 'core' registered with tools: ${toolNames.join(', ')}`);
  }

  register(info: Omit<PackageInfo, 'enabled' | 'builtin'>): PackageInfo {
    const pkg: PackageInfo = { ...info, enabled: true, builtin: false };
    this.packages.set(pkg.name, pkg);
    return pkg;
  }

  list(): PackageInfo[] {
    return [...this.packages.values()];
  }

  get(name: string): PackageInfo {
    const pkg = this.packages.get(name);
    if (!pkg) throw new NotFoundException(`package not found: ${name}`);
    return pkg;
  }

  activate(name: string): PackageInfo {
    const pkg = this.get(name);
    pkg.enabled = true;
    this.logger.log(`use_package: ${name} activated`);
    return pkg;
  }

  deactivate(name: string): PackageInfo {
    const pkg = this.get(name);
    pkg.enabled = false;
    this.logger.log(`package ${name} deactivated`);
    return pkg;
  }

  enabledToolNames(): string[] {
    const names: string[] = [];
    for (const pkg of this.packages.values()) {
      if (pkg.enabled) names.push(...pkg.tools);
    }
    return names;
  }

  async invokeProxy(qualified: string, params: Record<string, unknown>) {
    const [pkgName, toolName] = qualified.includes(':') ? qualified.split(':') : [undefined, qualified];
    if (pkgName) {
      const pkg = this.get(pkgName);
      if (!pkg.enabled) return { ok: false, error: `package '${pkgName}' not activated (use_package first)` };
    }
    const enabled = this.enabledToolNames();
    if (toolName && !enabled.includes(toolName)) {
      return { ok: false, error: `tool '${toolName}' not available in enabled packages` };
    }
    return this.tools.invoke(toolName!, params ?? {});
  }
}
