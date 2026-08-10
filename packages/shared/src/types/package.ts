// Plugin/Package system — manifest + tool registration (n8n-node inspired, adapted).

export interface PackageManifest {
  name: string;
  version: string;
  description?: string;
  author?: string;
  license?: string;
  /** Declared permission domains — enforced at runtime. */
  permissions: PackagePermission[];
  /** Dependencies on other packages. */
  dependencies?: Record<string, string>;
  tools: string[];
  /** Optional icon (data URL or asset path). */
  icon?: string;
}

export type PackagePermission = 'none' | 'file' | 'network' | 'terminal' | 'system' | 'device';

export type PackageSource = 'builtin' | 'sandbox' | 'mcp' | 'skill';

export interface PackageEntry {
  manifest: PackageManifest;
  source: PackageSource;
  /** true when activated for current session via use_package. */
  enabled: boolean;
  /** Runtime registry of tools exposed by this package. */
  registeredTools: string[];
}

/** Proxy call envelope: packageName:toolName. */
export interface PackageCall {
  tool: string; // "pkg:tool"
  params: Record<string, unknown>;
}
