export interface NineRouterStoredConfig {
  apiKey?: string;
  baseUrl: string;
  reasoningEnabled?: boolean;
  thinkingLevel?: "low" | "medium" | "high";
  webSearchEnabled?: boolean;
  updatedAt?: string;
}

export interface NineRouterCacheFile {
  identity: string;
  updatedAt: string;
  expiresAt: string;
  models: unknown[];
}

export interface NineRouterRuntimeState {
  lastRoutedModel?: string;
}

export interface PiLike {
  registerProvider?: (name: string, config: unknown) => unknown;
  registerCommand?: (name: string, handler: unknown, options?: unknown) => unknown;
  registerTool?: (name: string, tool: unknown) => unknown;
  on?: (event: string, handler: (...args: any[]) => unknown) => unknown;
  registerHook?: (event: string, handler: (...args: any[]) => unknown) => unknown;
  commands?: { register?: (name: string, handler: unknown, options?: unknown) => unknown };
  tools?: { register?: (name: string, tool: unknown) => unknown };
  hooks?: { register?: (event: string, handler: (...args: any[]) => unknown) => unknown };
  prompt?: (spec: unknown) => Promise<Record<string, string> | undefined>;
  input?: (spec: unknown) => Promise<string | undefined>;
}
