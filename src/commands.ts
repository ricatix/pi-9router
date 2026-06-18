import { clearCache, clearConfig, loadCache, loadConfig, saveConfig } from "./state.js";
import { normalizeBaseUrl } from "./auth.js";

export function createCommandHandler(api: { refresh: (ctx?: any) => Promise<string>; listModels: () => Promise<string[]>; status: (ctx?: any) => Promise<string>; setup: (ctx?: any) => Promise<string>; setReasoning: (v?: string) => Promise<string>; clearAll: () => Promise<string>; }) {
  return async (args?: string | { text?: string }, ctx?: any) => {
    const text = typeof args === "string" ? args : args?.text ?? "";
    const [sub, value] = text.trim().split(/\s+/, 2);
    if (!sub) return api.setup(ctx);
    if (sub === "status" || sub === "debug") return api.status(ctx);
    if (sub === "refresh" || sub === "reload") return api.refresh(ctx);
    if (sub === "models") return (await api.listModels()).join("\n");
    if (sub === "reasoning") return api.setReasoning(value);
    if (sub === "clear") return api.clearAll();
    if (sub === "setup" || sub === "config") return api.setup(ctx);
    return `Perintah tidak dikenal: ${sub}`;
  };
}
