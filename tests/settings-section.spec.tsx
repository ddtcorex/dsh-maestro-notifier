// @vitest-environment jsdom
/**
 * The notifier section as the shell mounts it: one settings.section page whose
 * controls come from the host over RPC.
 *
 * This package had no DOM spec before, which is why a render-level break in a
 * sibling package shipped with every gate green — see
 * `dsh-maestro-core` `tests/config/settings-tab.spec.tsx`. The assertions here
 * are deliberately about what mounts, not about class names.
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import '@testing-library/jest-dom/vitest'
import * as React from 'react'
import { render, screen, cleanup, waitFor } from '@testing-library/react'
import { NotifierSettings } from '../src/client/notifier/NotifierSettings.js'

function rpc(overrides: Record<string, unknown> = {}) {
  return vi.fn(async (endpoint: string) => {
    if (endpoint === 'getConfig') return { telegram: { chatId: '6155315724', hasBotToken: true }, policy: {} }
    return overrides[endpoint] ?? {}
  }) as any
}

afterEach(cleanup)

describe('NotifierSettings', () => {
  it('mounts its controls', async () => {
    const { container } = render(<NotifierSettings rpcCall={rpc()} />)

    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })
    // Selected by the data contract the host already pins, so this spec proves
    // the harness works without yet depending on the row rework.
    expect(container.querySelector('[data-notifier-secret="botToken"]')).toBeInTheDocument()
    expect(container.querySelector('[data-notifier-input="chatId"]')).toBeInTheDocument()
    expect(container.querySelector('[data-notifier-toggle="reviewNotifications"]')).toBeInTheDocument()
  })

  it('reports the stored-token state without revealing the token', async () => {
    const { container } = render(<NotifierSettings rpcCall={rpc()} />)

    // The host answers `hasBotToken`, never the value.
    await waitFor(() => {
      expect(screen.getByText(/A token is stored/)).toBeInTheDocument()
    })
    const input = container.querySelector('[data-notifier-secret="botToken"]') as HTMLInputElement
    expect(input.type).toBe('password')
    expect(input.value).toBe('')
  })

  it('saves the same patch the toggle always did', async () => {
    const call = rpc()
    const { container } = render(<NotifierSettings rpcCall={call} />)

    await waitFor(() => {
      expect(container.querySelector('[data-notifier-toggle="reviewNotifications"]')).toBeInTheDocument()
    })
    const toggle = container.querySelector('[data-notifier-toggle="reviewNotifications"]') as HTMLInputElement
    toggle.click()

    await waitFor(() => {
      expect(call).toHaveBeenCalledWith('saveConfig', { policy: { reviewNotifications: true } })
    })
  })
})

describe('NotifierSettings — house pattern', () => {
  it('draws the Maestro header: badge, title, status line', async () => {
    const { container } = render(<NotifierSettings rpcCall={rpc()} />)

    // The badge is how a user tells a Maestro section from a harness one at a
    // glance; it is the first thing every conforming section carries.
    expect(container.querySelector('[data-maestro-logo]')).toBeInTheDocument()

    const title = container.querySelector('[data-notifier-title]') as HTMLElement
    expect(title).toBeInTheDocument()
    expect(container.querySelector('[data-notifier-status]')).toBeInTheDocument()
  })

  it('holds each field in a two-column row so the control sits right', async () => {
    const { container } = render(<NotifierSettings rpcCall={rpc()} />)

    // Every field, not just some: a half-migrated section reads worse than
    // either extreme.
    const rows = container.querySelectorAll('[data-notifier-row]')
    expect(rows.length).toBeGreaterThanOrEqual(3)
    for (const row of rows) {
      expect(row.querySelector('[data-notifier-row-text]')).toBeInTheDocument()
      expect(row.querySelector('[data-notifier-control]')).toBeInTheDocument()
    }
  })

  it('gives every control an accessible name', async () => {
    render(<NotifierSettings rpcCall={rpc()} />)

    // The labels carried no htmlFor and the inputs no id, so nothing was
    // associated. getByLabelText is the assertion that fails when it regresses.
    await waitFor(() => {
      expect(screen.getByLabelText('Bot token')).toBeInTheDocument()
    })
    expect(screen.getByLabelText('Chat id')).toBeInTheDocument()
    expect(screen.getByLabelText('Review notifications')).toBeInTheDocument()
  })

  it('keeps the notice in the status line without reflowing the rows', async () => {
    const failing = vi.fn(async (endpoint: string) => {
      if (endpoint === 'getConfig') throw new Error('Telegram rejected the token')
      return {}
    }) as any
    const { container } = render(<NotifierSettings rpcCall={failing} />)

    await waitFor(() => {
      expect(screen.getByText('Telegram rejected the token')).toBeInTheDocument()
    })
    // Still announced, now in the header rather than as a block above the form.
    expect(container.querySelector('[data-notifier-status] [role="status"]')).toBeInTheDocument()
  })
})