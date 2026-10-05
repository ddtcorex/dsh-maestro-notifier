# AGENTS.md — dsh-maestro-notifier

## Purpose

Maestro Notifier is an optional DeepSeek Harness plugin that publishes a
provider-neutral notification service (`maestroNotifier`) backed by a pluggable
provider registry, plus the settings RPC and Settings tab for its own `notifier` domain. Telegram ships as the first built-in provider; future
providers (Slack, Discord, email, generic webhook) plug into the same registry —
either as new modules here or from third-party plugins calling
`ctx.maestroNotifier.register(provider)` — without touching any consumer.

## Design contract

- `NotifierProvider { id, send(target, message) }`. Delivery targets are
  provider-specific and opaque to the service (telegram:
  `{ botToken, chatId }`; a future slack might use `{ webhookUrl }`).
- `NotifierService { register(provider), ids(), send(providerId, target, message) }`.
  Unknown provider ids resolve to `{ sent: false, reason: 'unknown-provider' }`;
  providers never throw so an optional notifier cannot break its caller.
- **Transport only.** Message text is authored by consumer plugins — startup /
  PIN-rotation / review digests stay byte-for-byte with the plugins that own
  those domains. Never move domain copy into this package.
- **Consumers do not depend on this package at compile time.** They declare
  `maestroNotifier` structurally in their own type augmentation and list
  `'maestroNotifier'` in `inject`; install-time wiring is this package's own
  `cordis.patch.yml` row `maestro-notifier` (the meta bundle was retired).

## Layout

```
src/host/types.ts            # DeliveryResult, NotifyMessage, NotifyTarget, NotifierProvider, NotifierService
src/host/registry.ts         # createNotifierService()
src/host/providers/telegram.ts # createTelegramProvider(): protect_content, no link preview, 10 s timeout
src/host/index.ts            # Cordis row `maestro-notifier`; provides 'maestroNotifier', telegram pre-registered, serves the settings RPC
src/host/rpc.ts              # /dsh-maestro-notifier getConfig / saveConfig (bot token never returned)
src/host/validators.ts       # `notifier` domain validator (defineDomain)
src/host/vendor/store.ts     # embedded settings store, generated from dsh-maestro-core (scripts/vendor-store.mjs), hash-sealed
src/client/                  # Settings tab: settings.section id `maestro-notifier`, order 33
tests/                       # vitest: registry, telegram, rpc, validators, vendored store drift, settings section DOM spec
cordis.patch.yml             # bundle patch inserting the single row
```

## Development

Host plus client TypeScript package: `main` points at `./lib/index.js` and the
client bundle is `./lib/client.js`, so run `pnpm build` before runtime use and
never commit `lib/`. Settings are read and written through the embedded store
(`src/host/vendor/store.ts`) in `~/.dsh/dsh-maestro-config/settings.json`, key
`domains.notifier.telegram.{botToken,chatId}`. Do not hand-edit the vendored
store; regenerate it from `dsh-maestro-core`.

Cordis typing rule learned here: augment the `Context` from exactly **one**
file (`src/host/index.ts`). A second `declare module '@deepseek-ai/cordis'` in a
`.d.ts` conflicts silently — `skipLibCheck` hides the duplicate-merge error in
declaration files and the broken augmentation makes `ctx.provide`/`ctx.get`
disappear from the type surface.

## Git workflow

Default branch `master`; batches go through `feat/<topic>` / `fix/<topic>`
branches; Conventional Commits in imperative mood; one TDD task per commit;
never commit directly to `master`. Remote `origin` is
`git@github.com:ddtcorex/dsh-maestro-notifier.git`.
The `.gitignore` re-includes `!AGENTS.md` and `!CLAUDE.md` because the global
`core.excludesFile` ignores them; `CLAUDE.md` is a symlink to this file.

## Validation

```sh
pnpm verify   # tsc --noEmit
pnpm test     # vitest run
pnpm build    # emit lib/ (host and client bundle)
```

- **Always request approval before merge or release:** never merge a PR/MR or publish a release (`git tag`/`pnpm publish`/`gh release`) without an explicit human approval — request review (`gh pr ready` / `gh pr request-review` / ask in chat) and wait for `APPROVED`.
