import type { RawModel } from "./discovery.js";

export interface EnrichedModel extends RawModel { name?: string; family?: string; modalities?: string[]; toolCall?: boolean; costInput?: number; costOutput?: number; contextLimit?: number; outputLimit?: number; }

export async function enrichModels(rawModels: RawModel[]): Promise<EnrichedModel[]> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch("https://models.dev/api.json", { signal: controller.signal });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const catalog = (await response.json()) as Record<string, { models?: Record<string, any> }>;
    const map = new Map<string, any>();
    for (const [providerKey, provider] of Object.entries(catalog)) for (const [modelKey, entry] of Object.entries(provider.models ?? {})) { map.set(`${providerKey}/${modelKey}`, entry); map.set(modelKey, entry); }
    return rawModels.map((model) => { const entry = map.get(model.upstreamId) ?? map.get(model.upstreamId.split("/").pop() ?? model.upstreamId); return entry ? { ...model, name: entry.name ?? model.id, family: entry.family, modalities: entry.modalities, toolCall: entry.tool_call, costInput: entry.cost?.input, costOutput: entry.cost?.output, contextLimit: entry.limit?.context, outputLimit: entry.limit?.output } : { ...model, name: model.id }; });
  } catch { return rawModels.map((model) => ({ ...model, name: model.id })); }
}
