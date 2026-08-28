/** Provider-neutral notify contracts shared by the service, built-in providers, and consumers. */

export interface DeliveryResult {
  sent: boolean
  reason?: 'not-configured' | 'request-failed' | 'unknown-provider'
}

export interface NotifyMessage {
  text: string
}

/**
 * Delivery target is opaque to the service — each provider defines its own shape
 * (telegram: `{ botToken, chatId }`; a future slack: `{ webhookUrl }`; …).
 */
export type NotifyTarget = Record<string, unknown>

export interface NotifierProvider {
  readonly id: string
  send(target: NotifyTarget, message: NotifyMessage): Promise<DeliveryResult>
}

export interface NotifierService {
  register(provider: NotifierProvider): void
  ids(): string[]
  send(providerId: string, target?: NotifyTarget, message?: NotifyMessage): Promise<DeliveryResult>
}
