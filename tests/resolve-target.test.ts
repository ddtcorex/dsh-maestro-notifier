import { describe, it, expect } from 'vitest'
import { resolveTelegramTarget } from '../src/host/index.ts'

const getFrom = (domains: Record<string, unknown>) => async (d: string): Promise<unknown> => domains[d]

describe('resolveTelegramTarget', () => {
  it('resolves a full notifier.telegram pair', async () => {
    const target = await resolveTelegramTarget(getFrom({ notifier: { telegram: { botToken: 'b', chatId: 'c' } } }))
    expect(target).toEqual({ botToken: 'b', chatId: 'c' })
  })

  it('returns undefined for a partial pair', async () => {
    const target = await resolveTelegramTarget(getFrom({ notifier: { telegram: { botToken: 'b' } } }))
    expect(target).toBeUndefined()
  })

  it('ignores the legacy notify domain entirely', async () => {
    const target = await resolveTelegramTarget(getFrom({ notify: { telegram: { botToken: 'b', chatId: 'c' } } }))
    expect(target).toBeUndefined()
  })

  it('degrades to undefined when the domain read throws', async () => {
    const target = await resolveTelegramTarget(async () => { throw new Error('boom') })
    expect(target).toBeUndefined()
  })
})