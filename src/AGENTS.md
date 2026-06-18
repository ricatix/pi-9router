# SRC KNOWLEDGE BASE

## OVERVIEW
Flat TypeScript source for Pi extension runtime: auth → discovery → enrichment → provider registration → commands/cache.

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Extension entry | `index.ts` | default export; owns Pi integration and state wiring |
| Provider refresh | `index.ts:17` | network discovery, enrichment, cache write, provider registration |
| Cached boot | `index.ts:36` | registers cached models before refresh |
| Command routing | `commands.ts` | `/9router` subcommands; uses state + auth helpers |
| Env/base URL | `auth.ts` | defaults to `https://9router.com/v1`; trims trailing slashes |
| Remote models | `discovery.ts` | fetch + response validation + error mapping |
| Metadata shaping | `enrichment.ts` | `RawModel` → `EnrichedModel` |
| Pi model shapes | `models.ts` | model map and provider model builders |
| Persistence | `state.ts` | config/cache JSON in `~/.pi/agent/`; `chmod 600` writes |
| Types | `types.ts` | config/cache/runtime/Pi-like interfaces |
| Error taxonomy | `errors.ts` | auth/discovery/empty/validation errors |
| Crypto/log safety | `util.ts` | `sha256`, `redactSecret` |
| Orphan helpers | `web.ts` | compiled and published source, not exported by package map |

## CONVENTIONS
- Keep `.js` extensions in relative imports. Source is TS, emitted ESM must resolve.
- Keep plugin API defensive: optional Pi hooks via `?.`, loose `any` for unstable host context.
- Avoid moving tests into `src/`; `tsconfig.json` only builds source files.
- Use `node:` imports for built-ins.
- Persist user credentials only through `state.ts` helpers.
- Redact API key before returning caught error messages to user-visible command output.
- If source logic changes affect users, commands, config, routing, cache semantics, or published API, update root `README.md` too.

## ANTI-PATTERNS
- Do not add new public modules without matching `package.json` `exports` decision.
- Do not log raw `apiKey`, config file content, or cache identity input.
- Do not replace cache-first boot with network-only startup; offline cache path is intentional.
- Do not introduce bundler-only resolution; package build is plain `tsc` ESM.

## NOTES
- 34 top-level exports across 12 files; no classes except `errors.ts`.
- `index.ts` imports most modules; dependency direction should stay leaf modules → entrypoint, not entrypoint → back into leaves.
