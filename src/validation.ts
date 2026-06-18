import { NineRouterAuthError, NineRouterValidationError } from "./errors.js";

export async function validateCredentials(baseUrl: string, apiKey: string, firstModelId: string, timeoutMs = 10000): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: firstModelId, messages: [{ role: "user", content: "ping" }], max_tokens: 1, temperature: 0 }), signal: controller.signal });
    if (response.status === 401 || response.status === 403) throw new NineRouterAuthError("Invalid API key");
    if (!response.ok) throw new NineRouterValidationError(`Credential validation failed with HTTP ${response.status}`);
  } catch (error) { if (error instanceof Error && error.name === "AbortError") throw new NineRouterValidationError(`Credential validation timed out after ${timeoutMs}ms`); throw error; } finally { clearTimeout(timer); }
}
