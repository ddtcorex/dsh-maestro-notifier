# AGENTS.md — dsh-maestro-notifier

## Purpose

Maestro Notifier is an optional DeepSeek Harness plugin that publishes a
provider-neutral notification service (`maestroNotifier`) backed by a pluggable
provider registry. Telegram ships as the first built-in provider; future
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
  `maestroNotifier` structurally in their own `augment.d.ts` and list
  `'maestroNotifier'` in `inject`; install-time wiring goes through the meta
  bundle row `maestro-notifier`.

## Layout

```
src/types.ts            # DeliveryResult, NotifyMessage, NotifyTarget, NotifierProvider, NotifierService
src/registry.ts         # createNotifierService()
src/providers/telegram.ts # createTelegramProvider() — protect_content, no link preview, 10 s timeout
src/index.ts            # Cordis row `maestro-notifier`; provides 'maestroNotifier', telegram pre-registered
tests/                  # vitest: registry dispatch + telegram transport
cordis.patch.yml        # bundle patch inserting the single row
```

## Development

Host-only TypeScript package: `main` points at `./lib/index.js`, so run
`pnpm build` before runtime use and never commit `lib/`.

Cordis typing rule learned here: augment the `Context` from exactly **one**
file (`src/index.ts`). A second `declare module '@deepseek-ai/cordis'` in a
`.d.ts` conflicts silently — `skipLibCheck` hides the duplicate-merge error in
declaration files and the broken augmentation makes `ctx.provide`/`ctx.get`
disappear from the type surface.

## Git workflow

Default branch `master`; batches go through `feat/<topic>` / `fix/<topic>`
branches; Conventional Commits in imperative mood; one TDD task per commit;
never commit directly to `master`. Publishing remote:
`git@github.com:ddtcorex/dsh-maestro-notifier.git` (add when first pushing).
The `.gitignore` re-includes `!AGENTS.md` and `!CLAUDE.md` because the global
`core.excludesFile` ignores them; `CLAUDE.md` is a symlink to this file.

## Validation

```sh
pnpm verify   # tsc --noEmit
pnpm test     # vitest run
pnpm build    # emit lib/
```
