export const DEFAULT_CLOUD_URL = "https://9router.com/v1";

export function normalizeBaseUrl(input?: string): string {
  const candidate = (input?.trim() || DEFAULT_CLOUD_URL).replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(candidate)) {
    throw new Error("Base URL must include protocol");
  }
  return candidate.endsWith("/v1") ? candidate : `${candidate}/v1`;
}

export function readEnvAuth() {
  const apiKey = process.env["9ROUTER_API_KEY"] ?? process.env["NINE_ROUTER_API_KEY"];
  const baseUrl = process.env["9ROUTER_BASE_URL"] ?? process.env["NINE_ROUTER_BASE_URL"];
  return { apiKey: apiKey?.trim() || undefined, baseUrl: baseUrl?.trim() || undefined };
}
