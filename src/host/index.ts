import type { Context } from '@deepseek-ai/cordis'
import { readFlat, get, load } from '@ddtcorex/dsh-maestro-config-lib'
import { createNotifierService, type NotifierService } from './registry.ts'
import { createTelegramProvider } from './providers/telegram.ts'

export const name = 'maestro-notifier'

declare module '@deepseek-ai/cordis' {
  interface Context {
    maestroNotifier: NotifierService
  }
}

/** Publish the maestroNotifier service with the telegram provider pre-registered. */
export function apply(ctx: Context): void {
  const notifier = createNotifierService({
    // Standalone-friendly default target: read telegram from config domains
    // (notifier.telegram / notify.telegram via get/load) with flat fallback
    // (explicit caller targets still win).
    resolveTarget: async (providerId) => {
      if (providerId !== 'telegram') return undefined
      // 1) try notifier domain via get('notifier')
      try {
        const notifierCfg: any = await get('notifier').catch(() => undefined)
        if (notifierCfg?.telegram && typeof notifierCfg.telegram === 'object') {
          const botToken = notifierCfg.telegram.botToken
          const chatId = notifierCfg.telegram.chatId
          if (typeof botToken === 'string' && botToken && typeof chatId === 'string' && chatId) {
            return { botToken, chatId }
          }
        }
      } catch {}
      // 2) try notify domain via get('notify') for legacy mapping
      try {
        const notifyCfg: any = await get('notify').catch(() => undefined)
        if (notifyCfg?.telegram && typeof notifyCfg.telegram === 'object') {
          const botToken = notifyCfg.telegram.botToken
          const chatId = notifyCfg.telegram.chatId
          if (typeof botToken === 'string' && botToken && typeof chatId === 'string' && chatId) {
            return { botToken, chatId }
          }
        }
      } catch {}
      // 3) try load() domains directly (covers both)
      try {
        const doc: any = await load().catch(() => undefined)
        const domNotifier = doc?.domains?.notifier?.telegram
        if (domNotifier && typeof domNotifier.botToken === 'string' && domNotifier.botToken && typeof domNotifier.chatId === 'string' && domNotifier.chatId) {
          return { botToken: domNotifier.botToken, chatId: domNotifier.chatId }
        }
        const domNotify = doc?.domains?.notify?.telegram
        if (domNotify && typeof domNotify.botToken === 'string' && domNotify.botToken && typeof domNotify.chatId === 'string' && domNotify.chatId) {
          return { botToken: domNotify.botToken, chatId: domNotify.chatId }
        }
      } catch {}
      let flat: Record<string, unknown>
      try {
        flat = await readFlat()
      } catch {
        return undefined
      }
      const botToken = flat.telegramBotToken
      const chatId = flat.telegramChatId
      if (typeof botToken !== 'string' || botToken === '') return undefined
      if (typeof chatId !== 'string' || chatId === '') return undefined
      return { botToken, chatId }
    },
  })
  notifier.register(createTelegramProvider())
  ctx.provide('maestroNotifier', notifier)
}
