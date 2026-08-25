import type { DeliveryResult, NotifierProvider, NotifierService, NotifyMessage, NotifyTarget } from './types.ts'

/**
 * In-memory provider registry. `send` dispatches to the provider registered under
 * `providerId`; unknown ids resolve to `{ sent:false, reason:'unknown-provider' }`
 * so an optional notifier can never break a caller. Late registrations are visible
 * to the next send.
 */
export function createNotifierService(): NotifierService {
  const providers = new Map<string, NotifierProvider>()

  return {
    register(provider: NotifierProvider): void {
      providers.set(provider.id, provider)
    },

    ids(): string[] {
      return [...providers.keys()]
    },

    async send(providerId: string, target: NotifyTarget, message: NotifyMessage): Promise<DeliveryResult> {
      const provider = providers.get(providerId)
      if (provider === undefined) return { sent: false, reason: 'unknown-provider' }
      return provider.send(target, message)
    },
  }
}

export type { DeliveryResult, NotifierProvider, NotifierService, NotifyMessage, NotifyTarget }
