import type { EnrichedModel } from "./enrichment.js";

export function buildModelMap(enriched: EnrichedModel[], baseUrl: string) {
  const map: Record<string, any> = {};
  for (const model of enriched) map[model.id] = { id: model.id, providerID: "9router", upstreamId: model.upstreamId, api: { id: model.upstreamId, url: baseUrl, npm: "@ai-sdk/openai-compatible" }, name: model.name ?? model.upstreamId, capabilities: { temperature: true, reasoning: false, attachment: false, toolcall: model.toolCall ?? false, input: { text: true, audio: false, image: false, video: false, pdf: false }, output: { text: true, audio: false, image: false, video: false, pdf: false }, interleaved: false }, cost: { input: model.costInput ?? 0, output: model.costOutput ?? 0, cache: { read: 0, write: 0 } }, limit: { context: model.contextLimit ?? 128000, output: model.outputLimit ?? 4096 }, status: "active", options: {}, headers: {}, release_date: new Date().toISOString().split("T")[0] };
  return map;
}

export function buildProviderModels(enriched: EnrichedModel[], _baseUrl: string) {
  return enriched.map((model) => ({
    id: model.upstreamId,
    name: model.name ?? model.upstreamId,
    reasoning: false,
    input: normalizeInputModalities(model.modalities),
    cost: {
      input: model.costInput ?? 0,
      output: model.costOutput ?? 0,
      cacheRead: 0,
      cacheWrite: 0
    },
    contextWindow: model.contextLimit ?? 128000,
    maxTokens: model.outputLimit ?? 4096
  }));
}

function normalizeInputModalities(modalities: unknown): Array<"text" | "image"> {
  const base: Array<"text" | "image"> = ["text"];
  const hasImage = Array.isArray(modalities)
    ? modalities.includes("image")
    : !!modalities && typeof modalities === "object" && Array.isArray((modalities as { input?: unknown }).input) && (modalities as { input?: string[] }).input!.includes("image");
  return hasImage ? [...base, "image"] : base;
}
