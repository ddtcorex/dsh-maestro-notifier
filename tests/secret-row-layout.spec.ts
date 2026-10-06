import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'vitest'

/**
 * "Save token" must sit INLINE with the bot-token field.
 *
 * The markup was always `div[data-notifier-secret-group] > input + button`, so
 * asserting the marker would pass on the stacked layout too. These assertions
 * read the declaration instead — the marker says nothing about layout.
 */
const styles = readFileSync(new URL('../src/client/notifier/styles.ts', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
const panel = readFileSync(new URL('../src/client/notifier/NotifierSettings.tsx', import.meta.url), 'utf8')

/** The declaration body of the first rule whose selector list contains `selector`. */
function ruleBody(source: string, selector: string): string {
  const pattern = new RegExp(`([^{}]*\\${selector}[^{}]*)\\{([^}]*)\\}`, 'g')
  let match: RegExpExecArray | null
  while ((match = pattern.exec(source)) !== null) {
    if (match[1].split(',').some((part) => part.trim().endsWith(selector))) return match[2]
  }
  return ''
}

describe('the token field row', () => {
  it('lays the group out as a row, not a column', () => {
    const body = ruleBody(styles, '[data-notifier-secret-group]')
    assert.match(body, /display:\s*flex/)
    assert.match(
      body,
      /flex-direction:\s*row/,
      'the group must be a row; a column stacks Save token below the field',
    )
    assert.doesNotMatch(body, /flex-direction:\s*column/)
  })

  it('keeps the field flexible so it takes the free width', () => {
    // min-width: 220px is a floor and predates this change; only `width` pins.
    const body = ruleBody(styles, '[data-notifier-secret-group]')
    assert.doesNotMatch(body, /(?:^|[\s;])width:\s*\d/)
    assert.match(
      ruleBody(styles, '[data-notifier-secret-group] input'),
      /flex:\s*1/,
      'the input must flex to take the remaining width',
    )
    assert.match(
      ruleBody(styles, '[data-notifier-secret-group] input'),
      /min-width:\s*0/,
      'the input needs min-width:0 or it will not shrink below its intrinsic size',
    )
  })

  it('pins the button to the right edge and centres it against the field', () => {
    const body = ruleBody(styles, '[data-notifier-secret-group] button')
    assert.match(body, /flex:\s*none/)
    assert.match(body, /align-self:\s*center/)
    assert.doesNotMatch(
      body,
      /align-self:\s*flex-end/,
      'flex-end was the stacked-row placement this change replaces',
    )
  })

  it('keeps the token save disabled until the field holds something', () => {
    const group = panel.slice(panel.indexOf('data-notifier-secret-group'))
    assert.ok(
      /disabled:\s*busy\s*\|\|\s*botToken\s*===\s*''/.test(group),
      'Save token must stay disabled while the field is empty',
    )
  })

  it('keeps the button chrome it already had', () => {
    const body = ruleBody(styles, '[data-notifier-secret-group] button')
    assert.match(body, /border:\s*1px solid var\(--dsw-alias-border-l2\)/)
    assert.match(body, /background:\s*var\(--dsw-alias-bg-layer-1\)/)
    assert.match(body, /min-height:\s*32px/)
  })
})
