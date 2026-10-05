# Changelog

All notable changes to this project are documented in this file. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/); this project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Settings RPC on `/dsh-maestro-notifier` (`getConfig`, `saveConfig`): the package now owns
  the `notifier` settings domain and its validator, and never returns the bot token
  (the host answers `hasBotToken`) (#19).
- Settings tab (`settings.section` id `maestro-notifier`, order 33) for the Telegram target
  and the review-notification toggle, drawn in the Maestro house pattern with a DOM spec
  (#19, #21).

### Changed

- Embed the settings store at `src/host/vendor/store.ts` (generated from
  `dsh-maestro-core`, hash-sealed) instead of depending on `@ddtcorex/dsh-maestro-config-lib`;
  the settings file stays `~/.dsh/dsh-maestro-config/settings.json` (#19).

### Fixed

- Derive the browser loader id from the package manifest (#20).

## [0.1.2] - 2026-09-22

### Changed

- Declare package license, repository and Node engine range in the manifest (#14).
- Follow `@ddtcorex/dsh-maestro-config-lib` to `^0.3.0` — the previous pin
  could not reach the release that owns the shared settings store, so a
  registry install silently read the retired path (#15).

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
