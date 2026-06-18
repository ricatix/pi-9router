import { chmod, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import type { NineRouterCacheFile, NineRouterStoredConfig } from "./types.js";

export const CONFIG_PATH = join(homedir(), ".pi/agent/9router-config.json");
export const CACHE_PATH = join(homedir(), ".pi/agent/9router-models-cache.json");
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function ensureDir(filePath: string) { await mkdir(dirname(filePath), { recursive: true }); }

export async function loadConfig(): Promise<NineRouterStoredConfig | null> {
  try { return JSON.parse(await readFile(CONFIG_PATH, "utf8")) as NineRouterStoredConfig; } catch { return null; }
}

export async function saveConfig(config: NineRouterStoredConfig): Promise<void> {
  await ensureDir(CONFIG_PATH); await writeFile(CONFIG_PATH, JSON.stringify({ ...config, updatedAt: new Date().toISOString() }, null, 2), { mode: 0o600 });
  await chmod(CONFIG_PATH, 0o600).catch(() => undefined);
}

export async function clearConfig(): Promise<void> { await rm(CONFIG_PATH, { force: true }); }

export async function loadCache(): Promise<NineRouterCacheFile | null> {
  try { return JSON.parse(await readFile(CACHE_PATH, "utf8")) as NineRouterCacheFile; } catch { return null; }
}

export async function saveCache(identity: string, models: unknown[]): Promise<void> {
  await ensureDir(CACHE_PATH);
  const updatedAt = new Date().toISOString();
  await writeFile(CACHE_PATH, JSON.stringify({ identity, updatedAt, expiresAt: new Date(Date.now() + CACHE_TTL_MS).toISOString(), models }, null, 2), { mode: 0o600 });
  await chmod(CACHE_PATH, 0o600).catch(() => undefined);
}

export async function clearCache(): Promise<void> { await rm(CACHE_PATH, { force: true }); }
