import type { Context } from '@deepseek-ai/cordis'
import { readFlat } from '@ddtcorex/dsh-maestro-config-lib'
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
    // Standalone-friendly default target: read notify.telegram from the shared
    // settings store via the embedded lib (explicit caller targets still win).
    resolveTarget: async (providerId) => {
      if (providerId !== 'telegram') return undefined
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
