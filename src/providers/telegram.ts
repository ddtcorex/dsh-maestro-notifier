import type { DeliveryResult, NotifierProvider, NotifyMessage, NotifyTarget } from '../types.ts'

/**
 * Telegram delivery target. Missing or blank credentials short-circuit to
 * `not-configured` without touching the network.
 */
export interface TelegramNotifyTarget {
  botToken?: string
  chatId?: string
}

export interface TelegramProviderDependencies {
  fetch?: typeof globalThis.fetch
}

function isBlank(value: string | undefined): boolean {
  return value === undefined || value.trim() === ''
}

async function sendTelegramText(
  { botToken, chatId }: TelegramNotifyTarget,
  text: string,
  fetchImpl: typeof globalThis.fetch,
): Promise<DeliveryResult> {
  if (isBlank(botToken) || isBlank(chatId)) return { sent: false, reason: 'not-configured' }
  try {
    const response = await fetchImpl(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        protect_content: true,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10_000),
    })
    return response.ok ? { sent: true } : { sent: false, reason: 'request-failed' }
  } catch {
    return { sent: false, reason: 'request-failed' }
  }
}

/** Built-in Telegram transport. Never throws so an optional notifier cannot block its caller. */
export function createTelegramProvider(dependencies: TelegramProviderDependencies = {}): NotifierProvider {
  const fetchImpl = dependencies.fetch ?? globalThis.fetch
  return {
    id: 'telegram',
    send(target: NotifyTarget, message: NotifyMessage): Promise<DeliveryResult> {
      return sendTelegramText(target as TelegramNotifyTarget, message.text, fetchImpl)
    },
  }
}

export type { DeliveryResult, NotifyMessage, NotifyTarget }
