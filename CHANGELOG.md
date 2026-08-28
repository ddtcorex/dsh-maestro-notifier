# Changelog

All notable changes to this project are documented in this file. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-08-28

Initial release of `@ddtcorex/dsh-maestro-notifier`, a provider-neutral notification
service for the DeepSeek Harness with Telegram as the first transport.

### Added

- **Pluggable `maestroNotifier` service** — `register(provider)`, `ids()`,
  `send(providerId, target, message)` with an in-memory provider registry. Unknown
  provider ids resolve to `{ sent: false, reason: 'unknown-provider' }` and the
  service never throws so an optional notifier cannot break its caller.
- **Telegram provider** — one-way bot `sendMessage` with `parse_mode: HTML` (bold,
  code, links), `protect_content`, `disable_web_page_preview`, and a 10 s abort
  timeout. Missing or blank credentials short-circuit to `not-configured` without
  touching the network and credentials are never logged.
- **Store-backed default target** — when a caller omits `target` for `telegram`,
  an optional `resolveTarget` hook reads `telegramBotToken` / `telegramChatId` from
  the shared settings store (`~/.dsh/maestro/settings.json` via
  `@ddtcorex/dsh-maestro-config-lib`). Explicit targets win; resolver failures
  degrade to `{ sent: false, reason: 'not-configured' }`.
- **Cordis row `maestro-notifier`** via `cordis.patch.yml` (`/dsh-maestro-notifier`,
  alias `maestro-notifier` in `dsh-maestro-meta`) that provides `maestroNotifier`
  with Telegram pre-registered. Consumers depend structurally via `augment.d.ts`
  (`inject: ['maestroNotifier']`) without a compile-time dependency.

[0.1.0]: https://github.com/ddtcorex/dsh-maestro-notifier/releases/tag/v0.1.0
