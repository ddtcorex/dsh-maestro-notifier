import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTelegramProvider, type TelegramNotifyTarget } from '../src/host/providers/telegram.ts'

function okResponse() {
  return { ok: true } as Response
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('telegram provider', () => {
  it('reports not-configured and never calls fetch when the bot token is missing or blank', async () => {
    const fetchImpl = vi.fn()
    const provider = createTelegramProvider({ fetch: fetchImpl as unknown as typeof fetch })
    for (const target of [{}, { botToken: '', chatId: 'c' }, { botToken: '   ', chatId: 'c' }] as TelegramNotifyTarget[]) {
      const delivery = await provider.send(target, { text: 'hello' })
      expect(delivery).toEqual({ sent: false, reason: 'not-configured' })
    }
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('reports not-configured and never calls fetch when the chat id is missing or blank', async () => {
    const fetchImpl = vi.fn()
    const provider = createTelegramProvider({ fetch: fetchImpl as unknown as typeof fetch })
    for (const target of [{ botToken: 't' }, { botToken: 't', chatId: '' }, { botToken: 't', chatId: '  ' }] as TelegramNotifyTarget[]) {
      const delivery = await provider.send(target, { text: 'hello' })
      expect(delivery).toEqual({ sent: false, reason: 'not-configured' })
    }
    expect(fetchImpl).not.toHaveBeenCalled()
  })

  it('posts the protected plain-text payload to the bot API and reports success', async () => {
    const fetchImpl = vi.fn(async () => okResponse())
    const provider = createTelegramProvider({ fetch: fetchImpl as unknown as typeof fetch })

    const delivery = await provider.send({ botToken: 'BOT', chatId: 'CHAT' }, { text: 'DSH web is ready' })

    expect(delivery).toEqual({ sent: true })
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.telegram.org/botBOT/sendMessage')
    expect(init.method).toBe('POST')
    expect(init.headers).toEqual({ 'content-type': 'application/json' })
    expect(JSON.parse(String(init.body))).toEqual({
      chat_id: 'CHAT',
      text: 'DSH web is ready',
      parse_mode: 'HTML',
      protect_content: true,
      disable_web_page_preview: true,
    })
  })

  it('reports request-failed on a non-ok response', async () => {
    const fetchImpl = vi.fn(async () => ({ ok: false }) as Response)
    const provider = createTelegramProvider({ fetch: fetchImpl as unknown as typeof fetch })
    const delivery = await provider.send({ botToken: 'BOT', chatId: 'CHAT' }, { text: 'x' })
    expect(delivery).toEqual({ sent: false, reason: 'request-failed' })
  })

  it('reports request-failed when fetch throws and never rejects', async () => {
    const fetchImpl = vi.fn(async () => {
      throw new Error('offline')
    })
    const provider = createTelegramProvider({ fetch: fetchImpl as unknown as typeof fetch })
    await expect(provider.send({ botToken: 'BOT', chatId: 'CHAT' }, { text: 'x' })).resolves.toEqual({
      sent: false,
      reason: 'request-failed',
    })
  })
})
