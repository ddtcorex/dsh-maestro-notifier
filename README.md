# @ddtcorex/dsh-maestro-notifier

Pluggable notifier service for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness):
a tiny in-memory provider registry with Telegram as the first transport. Delivery is
**never-throw** — callers can notify without error handling; unknown providers and missing
targets resolve to `{ sent: false, reason }`.

Part of the Maestro Harness suite (`dsh-maestro-*`). Cordis patch row id: `maestro-notifier`
(`cordis.patch.yml`). It has a host half (service, Telegram provider, settings RPC) and a
client half (a Settings tab).

## What it provides

- **`maestroNotifier` service**: `register(provider)`, `ids()`,
  `send(providerId, target?, message)` dispatching to the registered provider.
- **Telegram provider** (one-way bot messages; `protect_content`, no link preview, 10 s
  timeout; credentials never logged).
- **Transport only** — message copy belongs to the consuming plugin; this package never
  authors domain text. Consumers depend on it structurally (a local type augmentation), never at
  compile time.
- **Default-target resolution**: when a caller omits the target, an optional `resolveTarget`
  hook reads `domains.notifier.telegram.{botToken,chatId}` from the shared settings store
  (`~/.dsh/dsh-maestro-config/settings.json`), through the store this package embeds at
  `src/host/vendor/store.ts`. Explicit targets win; any resolver failure degrades to `{ sent: false, reason: 'not-configured' }`.

```ts
const notifier = ctx.get('maestroNotifier')
await notifier.send('telegram', undefined, { text: 'review finished' }) // target resolved from the store
```

- **Settings RPC and tab**: the package owns the `notifier` settings domain (its own
  validator in `src/host/validators.ts`) and serves `getConfig` / `saveConfig` on
  `/dsh-maestro-notifier`. The bot token is write-only: the host answers `hasBotToken`,
  never the value. A Settings tab (`settings.section` id `maestro-notifier`, order 33)
  edits the Telegram target and the review-notification toggle.

## Install

```sh
dsh plugin --profile web add @ddtcorex/dsh-maestro-notifier
```

## Development

```sh
pnpm install
pnpm verify   # tsc --noEmit (host + client)
pnpm test     # vitest run
pnpm build    # tsc host + client, then the client bundle -> lib/
```

## License

MIT
