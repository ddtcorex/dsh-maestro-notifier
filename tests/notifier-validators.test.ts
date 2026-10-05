import { describe, expect, it, beforeEach, afterEach } from 'vitest'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { definedDomains, resetForTests, set } from '../src/host/vendor/store.js'
import '../src/host/validators.js'

/**
 * The store no longer registers this validator, so without a test here the
 * `notifier` domain would silently accept any shape after the cutover and no
 * suite would say so.
 *
 * EVERY case writes, so the store must be pointed at a scratch DSH_HOME before
 * the first write. `resolveDshHome` falls back to `~/.dsh` when the variable
 * is unset, which means a test that forgets this edits the operator's real
 * settings.json, and `set()` deep-merges, so it overwrites real values instead
 * of failing loudly.
 */
let home: string
let realHome: string | undefined

beforeEach(() => {
  realHome = process.env.DSH_HOME
  home = mkdtempSync(join(tmpdir(), 'notifier-validator-'))
  process.env.DSH_HOME = home
  resetForTests()
})

afterEach(() => {
  if (realHome === undefined) delete process.env.DSH_HOME
  else process.env.DSH_HOME = realHome
  resetForTests()
  rmSync(home, { recursive: true, force: true })
})
describe('notifier domain validator', () => {
  it('registers the notifier domain when the module is imported', () => {
    expect(definedDomains()).toContain('notifier')
  })

  it('accepts a well-formed telegram config', async () => {
    await expect(
      set('notifier', { telegram: { botToken: '123:abc', chatId: '-100200' } }),
    ).resolves.toBeUndefined()
  })

  it('accepts an absent value and a non-telegram policy', async () => {
    await expect(set('notifier', {})).resolves.toBeUndefined()
    await expect(set('notifier', { policy: { reviewNotifications: true } })).resolves.toBeUndefined()
  })

  it('rejects a chatId that is not a string', async () => {
    await expect(set('notifier', { telegram: { chatId: 42 } })).rejects.toThrow(/chatId/)
  })

  it('rejects a botToken that is not a string', async () => {
    await expect(set('notifier', { telegram: { botToken: 7 } })).rejects.toThrow(/botToken/)
  })

  it('rejects a non-boolean reviewNotifications', async () => {
    await expect(set('notifier', { policy: { reviewNotifications: 'yes' } })).rejects.toThrow(/reviewNotifications/)
  })

  it('rejects a domain value that is not an object', async () => {
    await expect(set('notifier', 'nope' as unknown as object)).rejects.toThrow(/notifier/)
  })

  it('leaves the store usable after a rejection', async () => {
    resetForTests()
    await expect(set('notifier', { telegram: { chatId: 1 } })).rejects.toThrow()
    await expect(set('notifier', { telegram: { chatId: '-1' } })).resolves.toBeUndefined()
    resetForTests()
  })

  it('never touches the operator home', () => {
    // The guard against the mistake this suite is most likely to make again:
    // `set()` deep-merges, so a suite that writes without a scratch DSH_HOME
    // silently overwrites real credentials instead of failing.
    expect(home).toContain('notifier-validator-')
    expect(process.env.DSH_HOME).toBe(home)
  })
})