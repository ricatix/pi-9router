import { describe, expect, test } from "bun:test";
import { normalizeBaseUrl } from "../src/auth.js";
import { redactSecret, sha256 } from "../src/util.js";
import { buildModelMap, buildProviderModels } from "../src/models.js";
import { createCommandHandler } from "../src/commands.js";

describe("core", () => {
  test("normalizeBaseUrl appends /v1", () => { expect(normalizeBaseUrl("https://example.com")).toBe("https://example.com/v1"); });
  test("normalizeBaseUrl keeps /v1", () => { expect(normalizeBaseUrl("https://example.com/v1")).toBe("https://example.com/v1"); });
  test("sha256 stable", () => { expect(sha256("abc")).toBe(sha256("abc")); });
  test("redactSecret hides literal secret and long tokens", () => { expect(redactSecret("token sk-1234567890abcdef visible", "sk-1234567890abcdef")).toBe("token [redacted] visible"); expect(redactSecret("value abcdefghijklmnop")).toBe("value [redacted]"); });
  test("buildModelMap maps provider id", () => { const map = buildModelMap([{ id: "9router/foo", upstreamId: "foo", name: "Foo" }], "https://example.com/v1"); expect(map["9router/foo"].providerID).toBe("9router"); expect(map["9router/foo"].api.id).toBe("foo"); });
  test("buildProviderModels omits compat.model", () => { const models = buildProviderModels([{ id: "9router/foo", upstreamId: "foo", modalities: { input: ["text", "image"] }, costInput: 1, costOutput: 2, contextLimit: 100, outputLimit: 10 } as any], "https://example.com/v1"); expect(models[0].id).toBe("foo"); expect(models[0].input).toEqual(["text", "image"]); expect((models[0] as any).compat).toBeUndefined(); expect(models[0].cost).toEqual(expect.objectContaining({ input: 1, output: 2 })); });
  test("command handler routes default/status/refresh", async () => { const calls: string[] = []; const handler = createCommandHandler({ refresh: async () => { calls.push("refresh"); return "refresh"; }, listModels: async () => ["a"], status: async () => { calls.push("status"); return "status"; }, setup: async () => { calls.push("setup"); return "setup"; }, setReasoning: async () => "reasoning", clearAll: async () => "clear" }); expect(await handler("")).toBe("setup"); expect(await handler("status")).toBe("status"); expect(await handler("refresh")).toBe("refresh"); expect(calls).toEqual(["setup", "status", "refresh"]); });
});
