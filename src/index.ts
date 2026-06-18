import { readEnvAuth, normalizeBaseUrl } from "./auth.js";
import { discoverModels } from "./discovery.js";
import { enrichModels } from "./enrichment.js";
import { buildModelMap, buildProviderModels } from "./models.js";
import { clearCache, clearConfig, loadCache, loadConfig, saveCache, saveConfig } from "./state.js";
import { createCommandHandler } from "./commands.js";
import { redactSecret, sha256 } from "./util.js";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default async function plugin(pi: ExtensionAPI) {
  const env = readEnvAuth();
  const stored = await loadConfig();
  let baseUrl = normalizeBaseUrl(env.baseUrl ?? stored?.baseUrl);
  let apiKey = env.apiKey ?? stored?.apiKey;
  const state = { lastRoutedModel: undefined as string | undefined };

  async function refresh(ctx?: any) {
    if (!apiKey) return "API key belum ada";
    try {
      const raw = await discoverModels(baseUrl, apiKey);
      const enriched = await enrichModels(raw);
      const models = buildModelMap(enriched, baseUrl);
      const providerModels = buildProviderModels(enriched, baseUrl);
      await saveCache(sha256(`${baseUrl}:${apiKey}`), enriched);
      if (pi.registerProvider) pi.registerProvider("9router", { name: "9router", api: "openai-completions", baseUrl, apiKey, authHeader: true, models: providerModels });
      const visibleCount = countVisible9routerModels(ctx);
      return `OK ${Object.keys(models).length} model ditemukan${visibleCount === undefined ? "" : `, ${visibleCount} terlihat di registry Pi`}`;
    } catch (e) {
      const cache = await loadCache();
      if (cache?.models?.length && pi.registerProvider) { pi.registerProvider("9router", { name: "9router", api: "openai-completions", baseUrl, apiKey, authHeader: true, models: buildProviderModels(cache.models as any, baseUrl) }); return `OK cache ${cache.models.length} model`; }
      const reason = e instanceof Error ? e.message : String(e);
      return `Gagal refresh: ${redactSecret(reason, apiKey)}`;
    }
  }

  async function registerCachedProvider(): Promise<number> {
    if (!apiKey || !pi.registerProvider) return 0;
    const cache = await loadCache();
    if (!cache?.models?.length) return 0;
    pi.registerProvider("9router", {
      name: "9router",
      api: "openai-completions",
      baseUrl,
      apiKey,
      authHeader: true,
      models: buildProviderModels(cache.models as any, baseUrl)
    });
    return cache.models.length;
  }

  const cachedModelCount = await registerCachedProvider();

  const handler = createCommandHandler({
    refresh,
    listModels: async () => Object.keys((await loadCache())?.models ? buildModelMap((await loadCache())!.models as any, baseUrl) : {}),
    status: async (ctx?: any) => {
      const cache = await loadCache();
      const visibleCount = countVisible9routerModels(ctx);
      return [`baseUrl=${baseUrl}`, `apiKey=${apiKey ? "set" : "unset"}`, `cache=${cache?.models?.length ?? 0} model`, visibleCount === undefined ? undefined : `registry=${visibleCount} model`].filter(Boolean).join("\n");
    },
    setup: async (ctx?: any) => {
      if (!ctx?.hasUI || !ctx?.ui?.input) return "Setup interaktif butuh TUI Pi. Pakai /9router setup di interactive mode atau isi ~/.pi/agent/9router-config.json";
      const nextBaseUrlInput = await ctx.ui.input("9router Base URL", baseUrl);
      if (nextBaseUrlInput === undefined) return "Setup dibatalkan";
      const nextApiKeyInput = await ctx.ui.input("9router API key", apiKey ? "API key sudah tersimpan; isi baru untuk mengganti" : "sk-...");
      if (!nextApiKeyInput?.trim()) return "API key wajib diisi";
      const nextBaseUrl = normalizeBaseUrl(nextBaseUrlInput);
      const nextApiKey = nextApiKeyInput.trim();
      await saveConfig({ ...(stored ?? { baseUrl: nextBaseUrl }), baseUrl: nextBaseUrl, apiKey: nextApiKey });
      baseUrl = nextBaseUrl;
      apiKey = nextApiKey;
      return refresh(ctx);
    },
    setReasoning: async (v) => { await saveConfig({ ...(stored ?? { baseUrl }), baseUrl, apiKey, reasoningEnabled: v === "on", thinkingLevel: (v as any) || stored?.thinkingLevel }); return "OK"; },
    clearAll: async () => { await clearCache(); await clearConfig(); apiKey = undefined; return "OK"; }
  });
  pi.registerCommand?.("9router", {
    description: "Manage 9router provider",
    handler: async (args: string, ctx: any) => {
      const result = await handler(args, ctx);
      if (ctx?.hasUI) ctx.ui.notify(result || "OK", result?.startsWith("Gagal") ? "error" : "info");
    }
  });
  registerPiTool(pi, {
    name: "ninerouter_status",
    label: "9router status",
    description: "Show 9router status",
    promptSnippet: "Check 9router status",
    parameters: { type: "object", properties: {} },
    execute: async (_toolCallId: string, _params: any, _signal: AbortSignal, _onUpdate: any, _ctx: any) => toolResult(`baseUrl=${baseUrl}\napiKey=${apiKey ? "set" : "unset"}\ncache=${(await loadCache())?.models?.length ?? 0}`)
  });
  pi.on?.("after_provider_response", (res: any) => { state.lastRoutedModel = res?.headers?.["x-9router-model"] ?? res?.headers?.["X-9Router-Model"]; });
  pi.on?.("session_start", async () => { void refresh(); });
  pi.on?.("model_select", (event: any) => {
    const selected = typeof event === "string"
      ? event
      : event?.model?.id ?? event?.modelId ?? event?.id;
    const provider = event?.model?.provider ?? event?.provider;
    if (provider === "9router" && selected) state.lastRoutedModel = selected;
  });
  if (cachedModelCount > 0) void refresh();
  else await refresh();
  return { refresh, state };
}

function toolResult(text: string) { return { content: [{ type: "text", text }], details: {} }; }

function registerPiTool(pi: ExtensionAPI, tool: any) { pi.registerTool?.(tool); }

function countVisible9routerModels(ctx?: any): number | undefined {
  const models = ctx?.modelRegistry?.getAll?.() ?? ctx?.modelRegistry?.getAvailable?.();
  if (!Array.isArray(models)) return undefined;
  return models.filter((model: any) => model?.provider === "9router").length;
}
