/**
 * Loopback RPC for the notifier's own settings, on the channel the package row
 * already reserved.
 *
 * The telegram keys used to be saved through `maestro.saveConfig` on
 * `/dsh-maestro-review`, which meant the plugin that owns the Telegram target
 * had no way to persist it and review had to know the key names. Both are now
 * wrong-way-round dependencies and both are gone.
 *
 * Every answer uses the `RpcResult` envelope. A bare `{ ok: true }` is not a
 * usable success: clients read `res.value`, so it answers every field with
 * `undefined` and renders an empty form that saves nothing.
 */
import { get, load, set } from './vendor/store.js'
// Side effect: this module is the only writer of the `notifier` domain, so the
// validator it imports is the one that must be registered when anything here
// runs. Without it a bad telegram shape is accepted and stored.
import './validators.js'

/** Single segment, per the harness channel contract. */
export const RPC_CHANNEL = '/dsh-maestro-notifier'

interface RpcResult<T> {
  ok: true
  value: T
}

type Failure = { ok: false; error: string }

const ok = <T>(value: T): RpcResult<T> => ({ ok: true, value })
const fail = (error: string): Failure => ({ ok: false, error })

/**
 * Secrets never travel back to the client. The client learns that a value is
 * present and can replace or clear it, never what it is.
 */
function maskSecrets(value: unknown): Record<string, unknown> {
  const cfg = (value ?? {}) as Record<string, any>
  const telegram = typeof cfg.telegram === 'object' && cfg.telegram !== null ? { ...cfg.telegram } : undefined
  if (telegram !== undefined) {
    if (typeof telegram.botToken === 'string' && telegram.botToken !== '') {
      delete telegram.botToken
      telegram.hasBotToken = true
    }
  }
  return { ...cfg, ...(telegram === undefined ? {} : { telegram }) }
}

/**
 * Accepts the domain's own nested shape rather than a flat key list, so the
 * client sends what the store holds and this package's own validator in
 * `validators.ts` is the single authority on the inner types. Two owners of a
 * shape is how a key silently stops being validated.
 *
 * Only `telegram` and `policy` are accepted; any other top-level key belongs
 * to another plugin and is rejected with a message that says so.
 */
async function saveNotifierConfig(payload: unknown): Promise<RpcResult<unknown> | Failure> {
  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return fail('Settings payload must be a JSON object.')
  }
  const input = payload as Record<string, unknown>
  for (const key of Object.keys(input)) {
    if (key !== 'telegram' && key !== 'policy') {
      return fail(`Unknown settings key "${key}".`)
    }
  }
  const patch: Record<string, unknown> = {}
  for (const key of ['telegram', 'policy'] as const) {
    if (input[key] !== undefined) patch[key] = input[key]
  }
  // Let the domain validator reject a bad inner type with its own message.
  await set('notifier', patch)
  return ok(maskSecrets(await get('notifier')))
}

export function createRpcHandler(): (endpoint: string, payload: unknown) => Promise<RpcResult<unknown> | Failure> {
  return async (endpoint, payload) => {
    try {
      switch (endpoint) {
        case 'getConfig':
          return ok(maskSecrets((await load()).domains.notifier))
        case 'saveConfig':
          return await saveNotifierConfig(payload)
        default:
          return fail(`unknown endpoint: ${String(endpoint)}`)
      }
    } catch (e: unknown) {
      return fail(e instanceof Error ? e.message : String(e))
    }
  }
}