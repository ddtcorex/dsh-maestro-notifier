/**
 * The Telegram target `dsh-maestro-notifier` owns.
 *
 * The bot token never comes back from the server: `getConfig` answers
 * `hasBotToken` instead of the value. A blank field keeps what is stored, a
 * filled field replaces it, and clearing happens server-side.
 */
import * as React from 'react'
import type { RpcCall } from '../index.js'
import { BrandBadge } from '../BrandMark.js'

interface Cfg {
  telegram?: { botToken?: string; chatId?: string; hasBotToken?: boolean }
  policy?: { reviewNotifications?: boolean }
}

/**
 * One setting, in the house pattern's two-column row: label and hint on the
 * left, control held right. `htmlFor`/`id` are what give the control its
 * accessible name — the previous markup rendered a bare `<label>` beside an
 * input with no `id`, so nothing was associated.
 */
function Field(props: { id: string; label: string; hint?: React.ReactNode; children?: React.ReactNode }) {
  return React.createElement(
    'div',
    { 'data-notifier-row': '' },
    React.createElement(
      'div',
      { 'data-notifier-row-text': '' },
      React.createElement('label', { 'data-notifier-label': '', htmlFor: props.id }, props.label),
      props.hint ? React.createElement('p', { 'data-notifier-hint': '' }, props.hint) : null,
    ),
    React.createElement('div', { 'data-notifier-control': '' }, props.children),
  )
}

export function NotifierSettings(props: { rpcCall: RpcCall }) {
  const { rpcCall } = props
  const [cfg, setCfg] = React.useState<Cfg>({})
  const [botToken, setBotToken] = React.useState('')
  const [chatId, setChatId] = React.useState('')
  const [busy, setBusy] = React.useState(false)
  const [notice, setNotice] = React.useState<{ tone: 'ok' | 'bad'; text: string } | null>(null)

  const fail = React.useCallback((e: unknown) => {
    setNotice({ tone: 'bad', text: e instanceof Error ? e.message : String(e) })
  }, [])

  const refresh = React.useCallback(async () => {
    setBusy(true)
    try {
      setCfg((await rpcCall('getConfig')) ?? {})
    } catch (e) {
      fail(e)
    } finally {
      setBusy(false)
    }
  }, [rpcCall, fail])

  React.useEffect(() => {
    void refresh()
  }, [refresh])

  const save = React.useCallback(
    async (patch: Record<string, unknown>) => {
      setBusy(true)
      try {
        await rpcCall('saveConfig', patch)
        // Clear the local field only after the save landed; otherwise a failed
        // save would silently discard what was just typed.
        if ('telegram' in patch) setBotToken('')
        setNotice({ tone: 'ok', text: 'Saved.' })
        await refresh()
      } catch (e) {
        fail(e)
      } finally {
        setBusy(false)
      }
    },
    [rpcCall, refresh, fail],
  )

  const telegram = cfg.telegram ?? {}

  return React.createElement(
    'div',
    { 'data-notifier-root': '' },
    // House header: badge, title, one-line status. The notice lives here so it
    // reports without pushing the rows down.
    React.createElement(
      'div',
      { 'data-notifier-header': '' },
      React.createElement(BrandBadge as any, { style: { alignSelf: 'flex-start', marginTop: 2 } }),
      React.createElement(
        'div',
        { 'data-notifier-heading': '' },
        React.createElement('h2', { 'data-notifier-title': '' }, 'Notifications'),
        React.createElement(
          'div',
          { 'data-notifier-status': '' },
          notice
            ? React.createElement('p', { 'data-notifier-notice': '', 'data-tone': notice.tone, role: 'status' }, notice.text)
            : React.createElement('span', null, 'Telegram target for digests and PIN notices.'),
        ),
      ),
    ),

    React.createElement('div', { 'data-notifier-actions': '' },
      React.createElement('button', { type: 'button', disabled: busy, onClick: () => void refresh() }, 'Refresh'),
    ),

    Field({
      id: 'notifier-bot-token',
      label: 'Bot token',
      hint: telegram.hasBotToken === true ? 'A token is stored. Leave blank to keep it.' : 'Not set.',
      children: React.createElement('input', {
        id: 'notifier-bot-token',
        type: 'password',
        value: botToken,
        placeholder: telegram.hasBotToken === true ? 'stored — type to replace' : 'not set',
        disabled: busy,
        autoComplete: 'new-password',
        'data-notifier-secret': 'botToken',
        onChange: (e: any) => setBotToken(e.target.value),
      }),
    }),

    Field({
      id: 'notifier-chat-id',
      label: 'Chat id',
      hint: 'The Telegram chat that receives digests and PIN notices.',
      children: React.createElement('input', {
        id: 'notifier-chat-id',
        type: 'text',
        value: chatId || String(telegram.chatId ?? ''),
        placeholder: '-1001234567890',
        disabled: busy,
        'data-notifier-input': 'chatId',
        onChange: (e: any) => setChatId(e.target.value),
        onBlur: () => void save({ telegram: { chatId: chatId || String(telegram.chatId ?? '') } }),
      }),
    }),

    React.createElement('div', { 'data-notifier-actions': '' },
      React.createElement('button', {
        type: 'button',
        disabled: busy || botToken === '',
        'data-notifier-save': 'botToken',
        onClick: () => void save({ telegram: { botToken } }),
      }, 'Save token'),
    ),

    Field({
      id: 'notifier-review-notifications',
      label: 'Review notifications',
      children: React.createElement('input', {
        id: 'notifier-review-notifications',
        type: 'checkbox',
        checked: cfg.policy?.reviewNotifications === true,
        disabled: busy,
        'data-notifier-toggle': 'reviewNotifications',
        onChange: (e: any) => void save({ policy: { reviewNotifications: e.target.checked } }),
      }),
    }),
  )
}