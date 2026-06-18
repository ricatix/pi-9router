import { createHash } from "node:crypto";

export function sha256(text: string): string { return createHash("sha256").update(text).digest("hex"); }
export function redactSecret(text: string, secret?: string): string {
  let redacted = text.replace(/[A-Za-z0-9_\-]{16,}/g, "[redacted]");
  if (secret) redacted = redacted.split(secret).join("[redacted]");
  return redacted;
}
