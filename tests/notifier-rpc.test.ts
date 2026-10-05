import { describe, expect, it } from 'vitest'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createRpcHandler } from '../src/host/rpc.js'

/**
 * The telegram settings endpoints moved here from review, which no longer
 * serves them. They travel on the channel notifier's own row already reserved.
 *
 * `get` must return the RpcResult envelope, not a bare `{ok:true}`: a client
 * reads `res.value`, so a bare ok answers every field with undefined and the
 * Settings card renders an empty form that saves nothing.
 */
function deps() {
  const home = mkdtempSync(join(tmpdir(), 'notifier-rpc-'))
  process.env.DSH_HOME = home
  return { home }
}

describe('notifier RPC envelope', () => {
  it('answers getConfig with an ok envelope carrying a value', async () => {
    deps()
    const handler = createRpcHandler()
    const res: any = await handler('getConfig', {})
    expect(res.ok).toBe(true)
    expect(res).toHaveProperty('value')
    expect(res.value).toBeTypeOf('object')
  })

  it('never returns the bot token, only its presence', async () => {
    const { home } = deps()
    const { set } = await import('../src/host/vendor/store.js')
    await set('notifier', { telegram: { botToken: '123:secret', chatId: '-100' } })
    const handler = createRpcHandler()
    const res: any = await handler('getConfig', {})
    expect(JSON.stringify(res.value)).not.toContain('123:secret')
    expect(res.value.telegram.hasBotToken).toBe(true)
  })

  it('saves the telegram keys through the domain store', async () => {
    deps()
    const handler = createRpcHandler()
    const res: any = await handler('saveConfig', { telegram: { chatId: '-100200' } })
    expect(res.ok).toBe(true)
    const { get } = await import('../src/host/vendor/store.js')
    expect((await get('notifier') as any).telegram.chatId).toBe('-100200')
  })

  it('rejects a nested value the domain validator refuses, with its reason', async () => {
    deps()
    const handler = createRpcHandler()
    const res: any = await handler('saveConfig', { telegram: { chatId: 42 } })
    expect(res.ok).toBe(false)
    expect(String(res.error)).toMatch(/chatId/)
  })

  it('answers an unknown endpoint with an ok:false error', async () => {
    deps()
    const handler = createRpcHandler()
    const res: any = await handler('nope', {})
    expect(res.ok).toBe(false)
    expect(typeof res.error).toBe('string')
  })

  it('uses the notifier channel, not the review one', async () => {
    const rpc = await import('../src/host/rpc.js')
    expect(rpc.RPC_CHANNEL).toBe('/dsh-maestro-notifier')
  })
})