# PROJECT KNOWLEDGE BASE

**Generated:** 2026-06-18T03:34:24Z  
**Commit:** c43a2f2  
**Branch:** main

## OVERVIEW
Pi Coding Agent extension for 9router. TypeScript ESM package, Bun runtime/test runner, `tsc` declaration build, npm OIDC publish.

## STRUCTURE
```
pi-9router/
├── src/                 # flat plugin source; 12 TS modules
├── tests/               # Bun test files; currently one root-level core test
├── .github/workflows/   # npm trusted publish pipeline
├── dist/                # generated build output; gitignored
├── package.json         # ESM export map, scripts, publish metadata
├── tsconfig.json        # strict ES2022 library build
└── bun.lock             # Bun dependency lockfile
```

## WHERE TO LOOK
| Task | Location | Notes |
|------|----------|-------|
| Plugin lifecycle | `src/index.ts` | default export `plugin(pi)`, registers provider, command, tool, Pi events |
| Auth/env config | `src/auth.ts` | `9ROUTER_API_KEY`, `NINE_ROUTER_API_KEY`, base URL normalization |
| Model discovery | `src/discovery.ts` | fetches `/models`, maps 9router model payloads |
| Model enrichment | `src/enrichment.ts` | optional model metadata normalization |
| Provider models | `src/models.ts` | Pi provider model shape builders |
| Local persistence | `src/state.ts` | `~/.pi/agent/9router-config.json`, `9router-models-cache.json` |
| Slash command | `src/commands.ts` | `/9router` command parser and actions |
| Error types | `src/errors.ts` | domain-specific errors |
| Utilities | `src/util.ts` | SHA-256 identity, secret redaction |
| Public types | `src/types.ts` | stored config/cache/runtime/Pi-like interfaces |
| Web helpers | `src/web.ts` | exported in source, not exported by package export map |
| Tests | `tests/core.test.ts` | Bun imports source modules directly |
| Publish | `.github/workflows/publish.yml` | Bun install/test/build, npm publish with OIDC provenance |

## CODE MAP
| Symbol | Type | Location | Refs | Role |
|--------|------|----------|------|------|
| `plugin` | default function | `src/index.ts:10` | entry | Pi extension entrypoint |
| `refresh` | nested function | `src/index.ts:17` | high | discovers models, registers provider, writes cache |
| `registerCachedProvider` | nested function | `src/index.ts:36` | local | boot from local cache before network refresh |
| `createCommandHandler` | function | `src/commands.ts:4` | `index.ts` | command dispatcher for setup/status/refresh/list/clear |
| `discoverModels` | function | `src/discovery.ts:5` | `index.ts` | remote model list fetch |
| `enrichModels` | function | `src/enrichment.ts:5` | `index.ts` | converts raw models to enriched shape |
| `buildModelMap` | function | `src/models.ts:3` | `index.ts`, tests | keyed model map for command output |
| `buildProviderModels` | function | `src/models.ts:9` | `index.ts` | Pi provider model array |
| `loadConfig` / `saveConfig` | functions | `src/state.ts:12` / `:16` | index/commands | persistent credentials/config |
| `loadCache` / `saveCache` | functions | `src/state.ts:23` / `:27` | index/commands | model cache persistence |
| `normalizeBaseUrl` | function | `src/auth.ts:3` | index/commands/tests | default URL + trailing slash trim |
| `NineRouter*Error` | classes | `src/errors.ts` | discovery/validation | typed failure modes |

## CONVENTIONS
- Runtime/package manager: Bun. Use `bun install`, `bun test`, `bun run build`, `bun run typecheck`.
- Build uses `tsc -p tsconfig.json`, not bundler. Output declarations required in `dist/`.
- ESM imports include `.js` extension in TypeScript source.
- `tsconfig.json` includes only `src/**/*.ts`; tests typechecked only by `bun test`, not `tsc`.
- Package export map exposes only `.` → `dist/index.js` + `dist/index.d.ts`.
- `files` publishes both `dist` and `src`; `src/web.ts` ships but has no export path.
- No ESLint/Prettier/Biome config. TypeScript strict compiler is main quality gate.
- Tests import from `../src/*.js`; keep source imports runtime-compatible with Bun/ESM.
- Update `README.md` in same PR when behavior, setup, commands, config, public API, model routing logic, or user-visible algorithms change.

## ANTI-PATTERNS (THIS PROJECT)
- Blind `npm publish` token flow. Workflow intentionally uses npm OIDC provenance, no `NPM_TOKEN`.
- Adding `registry-url` to `actions/setup-node` can inject `_authToken` and break OIDC publish.
- Node 22 publish path. Workflow requires Node 24/npm 11.5.1+ for trusted publishing.
- Publishing dead helpers. If `src/web.ts` stays non-public, remove from package payload or add export path deliberately.
- Writing secrets in logs/errors. Use `redactSecret` around API-key-adjacent failure text.
- Changing logic without docs. README must track user-visible behavior and setup changes.

## UNIQUE STYLES
- Plugin favors cache-first startup, then background refresh when cached models exist.
- User-facing command strings are Indonesian in current source.
- Domain storage under `~/.pi/agent/`, not project-local files.
- Provider name hard-coded as `9router`; Pi provider API shape is `openai-completions`.

## COMMANDS
```bash
bun install
bun test
bun run typecheck
bun run build
```

## NOTES
- Existing project scale: 44 repo files excluding `node_modules/.git`, 475 source/test TS lines, max depth 3.
- No existing `AGENTS.md` or `CLAUDE.md` found before generation.
- `dist/` present locally but gitignored; inspect source first unless validating build artifacts.
