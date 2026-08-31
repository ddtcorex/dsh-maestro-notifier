import type { Context } from '@deepseek-ai/cordis'
import { get } from '@ddtcorex/dsh-maestro-config-lib'
import { createNotifierService, type NotifierService } from './registry.ts'
import { createTelegramProvider } from './providers/telegram.ts'
import type { NotifyTarget } from './types.ts'

export const name = 'maestro-notifier'

declare module '@deepseek-ai/cordis' {
  interface Context {
    maestroNotifier: NotifierService
  }
}

/** Resolve the shared telegram target from the `notifier` domain only (legacy `notify` is no longer consulted). */
export async function resolveTelegramTarget(
  getDomain: (domain: string) => Promise<unknown>,
): Promise<NotifyTarget | undefined> {
  let notifierCfg: any
  try {
    notifierCfg = await getDomain('notifier')
  } catch {
    return undefined
  }
  const telegram = notifierCfg?.telegram
  if (typeof telegram !== 'object' || telegram === null) return undefined
  const botToken = telegram.botToken
  const chatId = telegram.chatId
  if (typeof botToken === 'string' && botToken && typeof chatId === 'string' && chatId) {
    return { botToken, chatId }
  }
  return undefined
}

/** Publish the maestroNotifier service with the telegram provider pre-registered. */
export function apply(ctx: Context): void {
  const notifier = createNotifierService({
    resolveTarget: (providerId) => (providerId === 'telegram' ? resolveTelegramTarget(get) : undefined),
  })
  notifier.register(createTelegramProvider())
  ctx.provide('maestroNotifier', notifier)
}
