import { NineRouterAuthError, NineRouterDiscoveryError, NineRouterEmptyModelsError } from "./errors.js";

export interface RawModel { id: string; upstreamId: string; }

export async function discoverModels(baseUrl: string, apiKey: string, timeoutMs = 10000): Promise<RawModel[]> {
  const url = `${baseUrl}/models`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { method: "GET", headers: { Authorization: `Bearer ${apiKey}` }, signal: controller.signal });
    if (response.status === 401 || response.status === 403) throw new NineRouterAuthError("Authentication failed");
    if (!response.ok) throw new NineRouterDiscoveryError(`Failed to fetch models (HTTP ${response.status})`);
    const data = (await response.json()) as { data?: Array<{ id: string }> };
    const models = Array.isArray(data.data) ? data.data : [];
    if (!models.length) throw new NineRouterEmptyModelsError();
    return models.map((m) => ({ id: `9router/${m.id}`, upstreamId: m.id }));
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw new NineRouterDiscoveryError(`Discovery timed out after ${timeoutMs}ms`);
    if (error instanceof NineRouterDiscoveryError || error instanceof NineRouterAuthError || error instanceof NineRouterEmptyModelsError) throw error;
    throw new NineRouterDiscoveryError(`Failed to connect to 9router at ${url}`);
  } finally { clearTimeout(timer); }
}
