import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const entry = readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../src/client/index.tsx'), 'utf8')

describe('maestro-notifier settings section', () => {
  it('declares id maestro-notifier at order 33', () => {
    expect(entry).toMatch(/id:\s*'maestro-notifier'[\s\S]{0,400}?order:\s*33/)
  })

  it('never reuses an order another section already claims', () => {
    for (const taken of [25, 26, 27, 28, 29, 31, 32, 40]) {
      expect(entry, `order ${taken}`).not.toMatch(new RegExp(`order:\\s*${taken}\\b`))
    }
  })

  it('serves only this package own channel', () => {
    expect(entry).toContain('/dsh-maestro-notifier')
    expect(entry).not.toContain('/dsh-maestro-review')
  })

  it('registers exactly one section', () => {
    expect(entry.match(/id:\s*'maestro-notifier'/g)?.length ?? 0).toBe(1)
  })
})