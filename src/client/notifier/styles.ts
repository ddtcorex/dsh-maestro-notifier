/**
 * Token-native styling for the remote settings section. Every colour and
 * radius resolves through a `--dsw-*` alias, so the section follows the shell
 * theme instead of carrying a palette of its own.
 *
 * The iOS block holds text fields at 16px on coarse pointers: iOS WebKit
 * magnifies the viewport for a focused field below that size, and a magnified
 * sheet never blurs back.
 */
export const NOTIFIER_CSS = `
[data-notifier-root], [data-notifier-root] * { box-sizing: border-box; }
[data-notifier-root] {
  display: flex; flex-direction: column; gap: 12px;
  color: var(--dsw-alias-label-primary);
  font-size: 13px; line-height: 1.5;
  min-width: 0; width: 100%; max-width: 640px;
}

/* House header: badge + title + one-line status. */
[data-notifier-header] { display: flex; gap: 10px; align-items: flex-start; padding: 2px 2px 8px; }
[data-notifier-heading] { display: flex; flex-direction: column; min-width: 0; }
[data-notifier-title] { margin: 0; font-size: 15px; font-weight: 600; line-height: 22px; }
[data-notifier-status] { font-size: 12px; line-height: 16px; color: var(--dsw-alias-label-secondary); overflow-wrap: anywhere; }
[data-notifier-status] [data-notifier-notice] { margin: 0; }
[data-notifier-status] [data-notifier-notice][data-tone="ok"] { color: var(--dsw-alias-state-success-primary); }
[data-notifier-status] [data-notifier-notice][data-tone="bad"] { color: var(--dsw-alias-state-error-primary); }

[data-notifier-actions] { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
[data-notifier-actions] button {
  min-height: 32px; padding: 0 12px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1);
  color: inherit; font: inherit; cursor: pointer;
}
[data-notifier-actions] button:disabled { opacity: 0.55; cursor: default; }
[data-notifier-actions] button:focus-visible { outline: 2px solid var(--dsw-alias-border-l2); outline-offset: 2px; }

/* House row: label and hint left, control held right, hairline between. */
[data-notifier-row] {
  display: flex; align-items: center; gap: 8px;
  padding: 16px 0; border-bottom: 1px solid var(--dsw-alias-border-l2); min-width: 0;
}
[data-notifier-row]:last-of-type { border-bottom: none; }
[data-notifier-row-text] { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; padding-right: 48px; }
[data-notifier-label] { font-size: 14px; font-weight: 400; line-height: 22px; color: var(--dsw-alias-label-primary); }
[data-notifier-hint] { margin: 0; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-tertiary); }
[data-notifier-control] { flex: none; display: flex; align-items: center; justify-content: flex-end; gap: 8px; min-height: 36px; }

/* A secret whose value is committed by a button: input and save travel
   together on ONE row. The button used to sit on a row of its own below the
   field — the group was a column and the button align-self: flex-end — which
   left it orphaned between two unrelated rows. It stays disabled until the
   field holds something, so proximity to that field is the point. */
[data-notifier-secret-group] { display: flex; flex-direction: row; align-items: center; gap: 8px; min-width: 220px; }
[data-notifier-secret-group] input { flex: 1 1 auto; min-width: 0; }
[data-notifier-secret-group] button {
  flex: none; align-self: center; min-height: 44px; padding: 0 12px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1);
  color: inherit; font: inherit; cursor: pointer;
}
[data-notifier-secret-group] button:disabled { opacity: 0.55; cursor: default; }
[data-notifier-secret-group] button:focus-visible { outline: 2px solid var(--dsw-alias-border-l2); outline-offset: 2px; }

/* Every row control gets the same box — the shared settings field box, copied
   from the host's own form primitive (ui-primitives ConfigField) so this tab
   follows the shell instead of carrying a geometry of its own. Only
   min-height: 44px is Maestro's: it is the touch target AGENTS.md requires,
   which the host's line-box sizing does not give. */
[data-notifier-control] input[type="text"], [data-notifier-control] input[type="password"], [data-notifier-control] select {
  min-height: 44px; padding: 6px 12px; border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-md); background: var(--dsw-alias-bg-layer-3);
  color: var(--dsw-alias-label-primary); font: inherit;
}
[data-notifier-control] input:focus-visible, [data-notifier-control] select:focus-visible {
  outline: 2px solid var(--dsw-alias-border-l2); outline-offset: 2px;
}

/* The checkbox is the one control the harness draws at its own size; without
   this it rendered at the UA default 13px beside 32px fields in the same row. */
[data-notifier-control] input[type="checkbox"] {
  width: 16px; height: 16px; margin: 0; flex: none;
  accent-color: var(--dsw-alias-brand-primary, #0A84FF);
}

[data-notifier-pin], [data-notifier-lan] { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
[data-notifier-pin] code, [data-notifier-lan] code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  padding: 2px 6px; border-radius: 6px; background: var(--dsw-alias-bg-layer-2);
}
[data-notifier-pin] button, [data-notifier-lan] button {
  min-height: 32px; padding: 0 10px; border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2); background: var(--dsw-alias-bg-layer-1);
  color: inherit; font: inherit; cursor: pointer;
}

@media (max-width: 640px) {
  /* Below the measure the row stacks: a right-held control has no room left,
     and a wrapped one reads as a third column. */
  [data-notifier-row] { flex-direction: column; align-items: stretch; gap: 8px; }
  [data-notifier-row-text] { padding-right: 0; }
  [data-notifier-control] { justify-content: flex-start; }
}

@media (max-width: 480px) {
  [data-notifier-actions] button { flex: 1 1 auto; min-height: 40px; }
}

/* iOS 16px field floor: the magnifier fires below this on a focused field. */
@media (max-width: 1023px) and (pointer: coarse) {
  html[data-mobile-nav-ios] [data-notifier-root] input,
  html[data-mobile-nav-ios] [data-notifier-root] select { font-size: 16px !important; }
}
`