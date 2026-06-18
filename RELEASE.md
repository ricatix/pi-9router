# Release Guide

This project uses SemVer and tag-based npm publishing.

Normal pushes to `main` do **not** publish to npm. npm publishing only happens when a Git tag matching `v*.*.*` is pushed.

## Versioning rules

Use latest released tag as baseline:

```bash
git describe --tags --abbrev=0
git log --oneline <latest-tag>..HEAD
git diff --stat <latest-tag>..HEAD
```

Let the agent recommend the next version from commits and diff.

### Stable releases

Use stable tags for production npm releases:

```txt
v0.1.1  patch release
v0.2.0  minor release
v1.0.0  major release
```

Stable tags publish to npm `latest`.

### Prereleases

Use prerelease tags for risky changes, publish workflow tests, or runtime validation before stable:

```txt
v0.2.0-rc.1
v0.2.0-beta.1
v0.2.0-alpha.1
```

Prerelease tags publish to npm `next`.

## Bump decision table

| Change type | Version bump |
| --- | --- |
| Breaking public behavior after `v1.0.0` | major |
| Breaking public behavior while `0.x` | minor |
| New user-visible feature | minor |
| Bug fix | patch |
| Runtime/provider behavior fix | patch or prerelease first if risky |
| Docs only | no release, unless npm package docs materially changed |
| Tests only | no release |
| CI only | no release, unless testing publish workflow with prerelease |
| Package metadata only | patch if published package output changes |

Conventional Commit hints:

```txt
feat(...)              -> minor
fix(...)               -> patch
perf(...)              -> patch
refactor(...)          -> patch if behavior-compatible
docs(...), test(...)   -> no release by default
ci(...), chore(...)    -> no release by default
BREAKING CHANGE / !    -> major after v1, minor while 0.x
```

## Recommended release flow

Before tagging, verify package quality:

```bash
bun run typecheck
bun test
bun run build
bun pm pack --dry-run
```

Recommended stable release flow:

```bash
# choose version from latest tag + diff, example: 0.2.0
# update package.json version to 0.2.0
git add package.json
git commit -m "chore(release): v0.2.0"

git tag -a v0.2.0 -m "v0.2.0"
git push origin main
git push origin v0.2.0
```

Recommended prerelease flow:

```bash
# choose prerelease version, example: 0.2.0-rc.1
# update package.json version to 0.2.0-rc.1
git add package.json
git commit -m "chore(release): v0.2.0-rc.1"

git tag -a v0.2.0-rc.1 -m "v0.2.0-rc.1"
git push origin main
git push origin v0.2.0-rc.1
```

The GitHub Actions workflow syncs package version from the tag before publishing, but keeping `package.json` updated in the release commit makes history easier to read.

## Agent release checklist

When asked to prepare a release, the agent should:

1. Inspect latest tag:

   ```bash
   git describe --tags --abbrev=0
   ```

2. Inspect changes since latest tag:

   ```bash
   git log --oneline <latest-tag>..HEAD
   git diff --stat <latest-tag>..HEAD
   ```

3. Recommend exact next tag and release type.

4. Explain why the bump is `patch`, `minor`, `major`, or prerelease.

5. Run release checks.

6. Ask for user confirmation before creating or pushing any tag.

7. Create an annotated tag only after confirmation.

## Tag safety

Do not create tags matching `v*.*.*` unless you intend to publish to npm.

Examples that publish:

```txt
v0.2.0
v0.2.0-rc.1
v1.0.0
```

Examples that do not publish:

```txt
backup-2026-06-18
experiment-a
draft/foo
```

Never move, delete, or reuse a tag after npm publish succeeds.

If the workflow fails before npm publish succeeds, the tag can be deleted and recreated. If npm publish succeeds, create a new version instead.

## Current publishing setup

- Workflow: `.github/workflows/publish.yml`
- Trigger: pushed tags matching `v*.*.*`
- Stable npm dist-tag: `latest`
- Prerelease npm dist-tag: `next`
- Authentication: npm Trusted Publishing via GitHub OIDC
- Required npm tooling in CI: npm `11.5.1+`
