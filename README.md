# @ddtcorex/dsh-maestro-notifier

Pluggable notifier service for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness):
a tiny in-memory provider registry with Telegram as the first transport. Delivery is
**never-throw** — callers can notify without error handling; unknown providers and missing
targets resolve to `{ sent: false, reason }`.

Part of the Maestro Harness suite (`dsh-maestro-*`). Cordis patch row id: `dsh-maestro-notifier`
(short alias `maestro-notifier` in the meta bundle).

## What it provides

- **`maestroNotifier` service**: `register(provider)`, `ids()`,
  `send(providerId, target?, message)` dispatching to the registered provider.
- **Telegram provider** (one-way bot messages; `protect_content`, no link preview, 10 s
  timeout; credentials never logged).
- **Transport only** — message copy belongs to the consuming plugin; this package never
  authors domain text. Consumers depend on it structurally (`augment.d.ts`), never at
  compile time.
- **Default-target resolution**: when a caller omits the target, an optional `resolveTarget`
  hook reads `notify.telegram` from the shared settings store
  (`~/.dsh/maestro/settings.json`, via `@ddtcorex/dsh-maestro-config-lib`). Explicit targets
  win; any resolver failure degrades to `{ sent: false, reason: 'not-configured' }`.

```ts
const notifier = ctx.get('maestroNotifier')
await notifier.send('telegram', undefined, { text: 'review finished' }) // target resolved from the store
```

## Install

```sh
dsh plugin --profile web add @ddtcorex/dsh-maestro-notifier
# or everything at once:
dsh plugin --profile web add @ddtcorex/dsh-maestro-meta
```

## Development

```sh
pnpm install
pnpm verify   # tsc --noEmit
pnpm test     # vitest run
pnpm build    # tsc -> lib/
```

## License

MIT
