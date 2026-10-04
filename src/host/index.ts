import type { Context } from '@deepseek-ai/cordis'
import { get } from './vendor/store.js'
import { createRpcHandler, RPC_CHANNEL } from './rpc.js'
import { createNotifierService, type NotifierService } from './registry.ts'
import { createTelegramProvider } from './providers/telegram.ts'
import type { NotifyTarget } from './types.ts'

export const name = 'maestro-notifier'
/** Side effect: registers the `notifier` domain validator the store used to register itself. */
import './validators.js'

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

  // The telegram settings moved here from review. The row must carry
  // `webServer`: rpc.handle registers its route inside an effect fiber that
  // carries only the ROW's inject, not the module's.
  ctx.effect(() =>
    (ctx as any).connection.rpc.handle(RPC_CHANNEL, createRpcHandler()),
    'maestro-notifier: settings rpc',
  )
}
