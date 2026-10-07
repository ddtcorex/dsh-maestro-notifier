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

## Requirements

- Node.js `^22.19.0 || >=24.0.0` and pnpm 11+. A shell that defaults to Node 20 fails with `No such built-in module: node:sqlite`; put a Node 22 `bin` first on `PATH` before running `dsh` or `pnpm`.
- DSH 0.1.x or 0.2.x (peer range `<0.3.0-0`).

## Install

```sh
dsh plugin --profile web add @ddtcorex/dsh-maestro-notifier
```

The package ships its own `cordis.patch.yml`, applied automatically. It includes a
`connection` entry that declares `webServer`, which DSH 0.2.x needs before
`rpc.handle` can register a channel. Do not copy it into the profile patch, and do not
add the rows by hand (duplicate ids crash the loader). Restart `dsh web` after install.

To get an exact release instead of whatever the package manager resolves, pin it:
`dsh plugin --profile web add @ddtcorex/dsh-maestro-notifier@<version>`.

Installed with `link:` from a checkout? After every `git pull`, run `pnpm install && pnpm build`
(`lib/` is gitignored) and restart `dsh web`.


## Development

```sh
pnpm install
pnpm verify   # tsc --noEmit (host + client)
pnpm test     # vitest run
pnpm build    # tsc host + client, then the client bundle -> lib/
```

## License

MIT
