import { defineDomain, type DomainValidator } from './vendor/store.js'

/**
 * The `notifier` domain, owned here rather than in the store.
 *
 * The store used to register this validator at import, which meant a plugin
 * that had no business knowing Telegram could still impose the shape of a
 * domain it does not own. Each owner now declares its own through
 * `defineDomain`, so an install without this package simply has no validator
 * for `notifier` and accepts any shape.
 *
 * Shape carried over from the validator this file replaces, so no accepted
 * write starts failing at the cutover.
 */
const notifierValidator: DomainValidator = {
  parse(value) {
    if (value === null || value === undefined) return { ok: true }
    if (typeof value !== 'object' || Array.isArray(value)) {
      return { ok: false, error: 'notifier must be an object' }
    }
    const v = value as Record<string, unknown>
    if (v.telegram !== undefined) {
      const telegram = v.telegram
      if (typeof telegram !== 'object' || telegram === null || Array.isArray(telegram)) {
        return { ok: false, error: 'telegram must be an object' }
      }
      const t = telegram as Record<string, unknown>
      if (t.botToken !== undefined && typeof t.botToken !== 'string') {
        return { ok: false, error: 'botToken must be a string' }
      }
      if (t.chatId !== undefined && typeof t.chatId !== 'string') {
        return { ok: false, error: 'chatId must be a string' }
      }
    }
    if (v.policy !== undefined) {
      const policy = v.policy
      if (typeof policy !== 'object' || policy === null || Array.isArray(policy)) {
        return { ok: false, error: 'policy must be an object' }
      }
      const reviewNotifications = (policy as Record<string, unknown>).reviewNotifications
      if (reviewNotifications !== undefined && typeof reviewNotifications !== 'boolean') {
        return { ok: false, error: 'reviewNotifications must be a boolean' }
      }
    }
    return { ok: true }
  },
}

defineDomain('notifier', notifierValidator)