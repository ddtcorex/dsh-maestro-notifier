import type { DeliveryResult, NotifierProvider, NotifierService, NotifyMessage, NotifyTarget } from './types.ts'

/**
 * In-memory provider registry. `send` dispatches to the provider registered under
 * `providerId`; unknown ids resolve to `{ sent:false, reason:'unknown-provider' }`
 * so an optional notifier can never break a caller. Late registrations are visible
 * to the next send.
 */
export interface NotifierServiceOptions {
  /**
   * Resolves a default target when the caller omits one (e.g. reading
   * `notify.telegram` from the shared settings store). A throwing or empty
   * resolution degrades to `{ sent:false, reason:'not-configured' }`.
   */
  resolveTarget?: (providerId: string) => Promise<NotifyTarget | undefined> | NotifyTarget | undefined
}

export function createNotifierService(options: NotifierServiceOptions = {}): NotifierService {
  const providers = new Map<string, NotifierProvider>()

  return {
    register(provider: NotifierProvider): void {
      providers.set(provider.id, provider)
    },

    ids(): string[] {
      return [...providers.keys()]
    },

    async send(
      providerId: string,
      target?: NotifyTarget,
      message?: NotifyMessage,
    ): Promise<DeliveryResult> {
      const provider = providers.get(providerId)
      if (provider === undefined) return { sent: false, reason: 'unknown-provider' }
      let effective = target
      if (effective === undefined && options.resolveTarget !== undefined) {
        try {
          effective = await options.resolveTarget(providerId)
        } catch {
          return { sent: false, reason: 'not-configured' }
        }
      }
      if (effective === undefined || message === undefined) {
        return { sent: false, reason: 'not-configured' }
      }
      return provider.send(effective, message)
    },
  }
}

export type { DeliveryResult, NotifierProvider, NotifierService, NotifyMessage, NotifyTarget }
