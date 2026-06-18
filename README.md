# pi-9router

[![npm version](https://img.shields.io/npm/v/pi-9router.svg)](https://www.npmjs.com/package/pi-9router)
[![npm downloads](https://img.shields.io/npm/dm/pi-9router.svg)](https://www.npmjs.com/package/pi-9router)

Pi Coding Agent extension for [9router](https://9router.com): register 9router as a Pi provider, discover models dynamically, enrich model metadata, and manage configuration from Pi with `/9router`.

Repository: <https://github.com/ricatix/pi-9router>

## Why this exists

9router exposes an OpenAI-compatible API in front of many upstream models. This extension makes Pi see 9router as a native provider:

```text
Pi Coding Agent ── OpenAI-compatible API ── 9router ── upstream models
```

You get one provider in Pi, backed by whatever models/routes your 9router instance exposes.

## Features

- **Pi provider registration** — registers `9router` with Pi through `registerProvider`.
- **Dynamic model discovery** — fetches available models from `GET /v1/models`.
- **OpenAI-compatible chat** — uses Pi's `openai-completions` provider mode.
- **Model metadata enrichment** — supplements discovered models with `models.dev` metadata when available.
- **Local model cache** — starts from cache when possible, then refreshes in background.
- **Graceful startup** — Pi remains usable even when 9router is not configured yet.
- **Dual env var support** — accepts both `NINE_ROUTER_*` and `9ROUTER_*` names.
- **Interactive setup** — configure from Pi using `/9router setup`.
- **Slash command management** — status, refresh, model listing, reasoning toggle, config clear.
- **Secret-safe output** — API keys are not printed in status/error output.

Web search/fetch tools are intentionally not registered yet. The extension only exposes `ninerouter_status` until a stable 9router web-route contract is available.

## Requirements

- [Pi Coding Agent](https://github.com/earendil-works/pi)
- Bun for local development/build
- A 9router API key and reachable 9router base URL

Default base URL:

```text
https://9router.com/v1
```

## Installation

### From npm

```bash
pi install npm:pi-9router
```

If your Pi version uses `~/.pi/agent/settings.json` package entries, add:

```json
{
  "packages": ["npm:pi-9router"]
}
```

### From GitHub

```bash
pi install git:github.com/ricatix/pi-9router
```

Or in `~/.pi/agent/settings.json`:

```json
{
  "packages": ["git:github.com/ricatix/pi-9router"]
}
```

### Local checkout

```bash
git clone https://github.com/ricatix/pi-9router.git
cd pi-9router
bun install
bun run build
```

Then add local path to Pi settings:

```json
{
  "packages": ["/absolute/path/to/pi-9router"]
}
```

Example:

```json
{
  "packages": ["/Users/ricoaditya/Project/open-source-project/pi-9router"]
}
```

Restart Pi after changing packages.

## Configuration

You can configure 9router by environment variables or by `/9router setup`.

### Environment variables

Recommended variable names:

```bash
export NINE_ROUTER_API_KEY="your-api-key"
export NINE_ROUTER_BASE_URL="https://9router.com/v1"
```

Also supported:

```bash
export 9ROUTER_API_KEY="your-api-key"
export 9ROUTER_BASE_URL="https://9router.com/v1"
```

`NINE_ROUTER_*` is safer in shells because variable names beginning with digits can be awkward or invalid in some environments.

### Config files

Persistent config:

```text
~/.pi/agent/9router-config.json
```

Model cache:

```text
~/.pi/agent/9router-models-cache.json
```

Files containing secrets are written with restricted permissions when possible.

### URL normalization

`NINE_ROUTER_BASE_URL` can be provided with or without `/v1`:

```text
https://9router.com
https://9router.com/v1
```

Both normalize to:

```text
https://9router.com/v1
```

Protocol is required. Use `https://...` or `http://...`.

## Usage

Start Pi after installing/configuring the extension:

```bash
pi
```

Run status:

```text
/9router status
```

Refresh discovered models:

```text
/9router refresh
```

List cached models:

```text
/9router models
```

Open interactive setup:

```text
/9router setup
```

After discovery succeeds, select a 9router model from Pi's model picker. Models are registered under provider `9router`.

## `/9router` commands

| Command | Description |
| --- | --- |
| `/9router` | Opens interactive setup when no sub-command is provided. |
| `/9router setup` | Prompts for base URL and API key in Pi TUI. |
| `/9router status` | Shows base URL, whether API key is set, cache count, and visible registry count when available. |
| `/9router refresh` | Fetches latest models from 9router, enriches metadata, updates cache, and re-registers provider. |
| `/9router reload` | Alias for `refresh`. |
| `/9router models` | Prints cached model IDs. |
| `/9router reasoning on` | Stores reasoning toggle as enabled. |
| `/9router reasoning off` | Stores reasoning toggle as disabled. |
| `/9router clear` | Clears local config and model cache. |
| `/9router debug` | Alias for `status`. |
| `/9router config` | Alias for `setup`. |

Note: reasoning config is persisted for future compatibility. Current provider model registration keeps reasoning disabled unless future 9router/Pi contracts expose a stable thinking mapping.

## LLM tools

This extension registers one Pi tool:

| Tool | Description |
| --- | --- |
| `ninerouter_status` | Returns base URL, API-key presence, and cache count. |

Web search/fetch tools are not exposed in this release.

## How startup works

1. Read env vars and saved config.
2. Normalize base URL.
3. Register cached provider immediately if model cache exists.
4. Refresh models in background when cache exists.
5. On first run with no cache, wait for discovery so Pi can list models.
6. If discovery fails but cache exists, keep cached models registered.
7. If no API key exists, Pi still loads and `/9router setup` remains available.

## Troubleshooting

### `API key belum ada`

Set API key using env vars or run:

```text
/9router setup
```

### No 9router models in Pi

Run:

```text
/9router status
/9router refresh
```

Check:

- `NINE_ROUTER_API_KEY` is set.
- `NINE_ROUTER_BASE_URL` points to a reachable 9router endpoint.
- `GET <baseUrl>/models` returns model data.

For default hosted 9router:

```bash
curl -H "Authorization: Bearer $NINE_ROUTER_API_KEY" https://9router.com/v1/models
```

### `Gagal refresh`

Common causes:

- Invalid API key.
- Base URL missing protocol.
- Network/TLS issue.
- 9router instance returned no models.

The extension redacts long token-like strings and your literal API key from errors.

### Interactive setup not available

`/9router setup` needs Pi TUI context. In non-interactive/headless mode, use env vars or edit:

```text
~/.pi/agent/9router-config.json
```

### Env var beginning with digit fails

Use `NINE_ROUTER_API_KEY` instead of `9ROUTER_API_KEY`.

## Development

```bash
git clone https://github.com/ricatix/pi-9router.git
cd pi-9router
bun install
bun run typecheck
bun test
bun run build
```

### Project structure

```text
pi-9router/
├── src/
│   ├── index.ts        # Pi extension entrypoint
│   ├── auth.ts         # env auth and base URL normalization
│   ├── discovery.ts    # 9router /models discovery
│   ├── enrichment.ts   # models.dev metadata enrichment
│   ├── validation.ts   # credential validation helper
│   ├── models.ts       # Pi/OpenCode model mapping helpers
│   ├── state.ts        # config/cache persistence
│   ├── commands.ts     # /9router command router
│   ├── web.ts          # reserved web helper module
│   ├── errors.ts       # custom errors
│   ├── util.ts         # hashing/redaction utilities
│   └── types.ts        # local shared types
├── tests/
│   └── core.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

### Validation

Run before pushing or publishing:

```bash
bun run typecheck
bun test
bun run build
```

## Publishing checklist

Before publishing:

1. Verify package metadata in `package.json`.
2. Run validation commands.
3. Confirm `dist/` is fresh.
4. Confirm README install commands point to the intended npm package.
5. Confirm no secrets in config, cache, shell history, or test fixtures.
6. Tag release in GitHub.
7. Publish to npm.

Build and publish:

```bash
bun install
bun run typecheck
bun test
bun run build
npm publish
```

Install published package:

```bash
pi install npm:pi-9router
```

## Security

- API keys are sent only to the configured 9router base URL through `Authorization: Bearer ...`.
- Status output shows only `set` or `unset`, never key values.
- Config/cache files are written under `~/.pi/agent/`.
- Config files are restricted to owner read/write where the platform allows it.
- Model cache contains model metadata, not credentials.
- Do not commit local `~/.pi/agent/9router-config.json` or API keys.

Report security issues privately through GitHub once repository security advisories are enabled:

<https://github.com/ricatix/pi-9router/security>

## Roadmap

- Stable web search/fetch tools after 9router web-route contract is finalized.
- Full reasoning/thinking mapping when Pi and 9router expose a stable compatible shape.
- More integration tests against a live Pi extension runtime.

## License

License not declared yet. Add `LICENSE` before public npm release.
