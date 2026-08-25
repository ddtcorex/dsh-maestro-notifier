import { describe, expect, it } from 'vitest'
import { createNotifierService, type NotifierProvider } from '../src/registry.ts'

function fakeProvider(id: string, result = { sent: true as const }): NotifierProvider {
  return {
    id,
    send: async () => result,
  }
}

describe('notifier registry', () => {
  it('dispatches send to the provider registered under the requested id', async () => {
    const seen: Array<{ id: string; target: unknown; text: string }> = []
    const service = createNotifierService()
    service.register({
      id: 'telegram',
      send: async (target, message) => {
        seen.push({ id: 'telegram', target, text: message.text })
        return { sent: true }
      },
    })

    const delivery = await service.send('telegram', { botToken: 't', chatId: 'c' }, { text: 'hello' })

    expect(delivery).toEqual({ sent: true })
    expect(seen).toEqual([{ id: 'telegram', target: { botToken: 't', chatId: 'c' }, text: 'hello' }])
  })

  it('returns unknown-provider without throwing for an unregistered id', async () => {
    const service = createNotifierService()
    const delivery = await service.send('slack', {}, { text: 'hi' })
    expect(delivery).toEqual({ sent: false, reason: 'unknown-provider' })
  })

  it('lists registered provider ids', () => {
    const service = createNotifierService()
    expect(service.ids()).toEqual([])
    service.register(fakeProvider('telegram'))
    service.register(fakeProvider('slack'))
    expect(service.ids()).toEqual(['telegram', 'slack'])
  })

  it('surfaces a late registration to the next send', async () => {
    const service = createNotifierService()
    const before = await service.send('slack', {}, { text: 'hi' })
    expect(before.sent).toBe(false)

    service.register(fakeProvider('slack', { sent: true }))
    const after = await service.send('slack', {}, { text: 'hi' })
    expect(after).toEqual({ sent: true })
  })

  it('propagates the provider delivery result verbatim', async () => {
    const service = createNotifierService()
    service.register(fakeProvider('telegram', { sent: false, reason: 'request-failed' }))
    const delivery = await service.send('telegram', { botToken: 't', chatId: 'c' }, { text: 'x' })
    expect(delivery).toEqual({ sent: false, reason: 'request-failed' })
  })
})
