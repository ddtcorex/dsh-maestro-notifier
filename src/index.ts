import type { Context } from '@deepseek-ai/cordis'
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
  const notifier = createNotifierService()
  notifier.register(createTelegramProvider())
  ctx.provide('maestroNotifier', notifier)
}
