import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/**
 * Guards the cordis peer contract.
 *
 * Cordis is a runtime peer, not a `@deepseek-ai/dsh*` package, so the host's
 * profile row gate never reads it: `unmetRequirements` filters on
 * `@deepseek-ai/dsh` and `@deepseek-ai/dsh-*` names only. A stale cordis range
 * is therefore genuinely unsatisfied yet never denied, and it rots silently
 * until a registry install reports unmet peers.
 *
 * The check is structural and dependency-free on purpose, matching the sibling
 * packages: `semver` is not a dependency here, and hand-rolling a comparator is
 * how a guard starts lying. Pin the literal to the build the host bundles.
 */
const here = dirname(fileURLToPath(import.meta.url))
const manifest = JSON.parse(readFileSync(resolve(here, '../package.json'), 'utf8')) as {
  peerDependencies?: Record<string, string>
}

/** The cordis build the host bundles. Bump with every harness upgrade. */
const CORDIS_PEER_RANGE = '~4.1.0 || ~4.2.0-alpha.1'

describe('cordis peer range', () => {
  it('declares the peer (sanity: the guard would be vacuous otherwise)', () => {
    expect(manifest.peerDependencies?.['@deepseek-ai/cordis']).toBeDefined()
  })

  it('pins the build the host actually ships', () => {
    expect(manifest.peerDependencies?.['@deepseek-ai/cordis']).toBe(CORDIS_PEER_RANGE)
  })
})
