"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = exports.NOTIFIER_CHANNEL = void 0;
exports.makeRpcCall = makeRpcCall;
exports.apply = apply;
/**
 * dsh-maestro-notifier — client bundle entry.
 *
 * Registers `settings.section` id `maestro-notifier` (order 33): the Telegram
 * target this package owns.
 *
 * The section exists because the Telegram keys moved here from review. Without
 * it, review gave up saving them and nothing replaced the ability to.
 */
const React = __importStar(require("react"));
const NotifierSettings_js_1 = require("./notifier/NotifierSettings.js");
const styles_js_1 = require("./notifier/styles.js");
const settings_nav_icon_js_1 = require("./settings-nav-icon.js");
/** The channel this row serves; the one it always reserved. */
exports.NOTIFIER_CHANNEL = '/dsh-maestro-notifier';
/**
 * Unwrap the `RpcResult` envelope. A bare `{ ok: true }` is not a usable
 * answer: the value is what the form renders, so an endpoint that forgets it
 * produces an empty card that saves nothing and reports no error.
 */
function unwrap(res) {
    return res && typeof res === 'object' && 'ok' in res ? (res.ok ? res.value : null) : res;
}
function makeRpcCall(ctx) {
    return async (endpoint, payload) => {
        const conn = ctx.get?.('connection');
        if (conn?.rpc?.call === undefined)
            throw new Error('RPC not available');
        const res = await conn.rpc.call(exports.NOTIFIER_CHANNEL, endpoint, payload ?? {});
        const value = unwrap(res);
        if (value === null) {
            throw new Error(String(res?.error?.message ?? res?.error ?? endpoint));
        }
        return value;
    };
}
const NOTIFIER_NAV_CSS = `
[${settings_nav_icon_js_1.SETTINGS_NAV_MARKER}] > svg:first-child,
[${settings_nav_icon_js_1.SETTINGS_NAV_MARKER}] > svg.zWKi1a_navIcon {
  display: none !important;
}

[${settings_nav_icon_js_1.SETTINGS_NAV_MARKER}]::before {
  content: '';
  flex: none;
  width: 16px;
  height: 16px;
  display: inline-block;
  background: currentColor;
  -webkit-mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 11 L5 4 L8 9 L11 4 L14 11'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='none' stroke='black' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M2 11 L5 4 L8 9 L11 4 L14 11'/%3E%3C/svg%3E") center / contain no-repeat;
}
`;
function installStyleTag(css, pluginCss) {
    if (typeof document === 'undefined')
        return () => { };
    const tag = document.createElement('style');
    tag.dataset.plugin = '@ddtcorex/dsh-maestro-notifier';
    tag.dataset.pluginCss = pluginCss;
    tag.textContent = css;
    document.head.appendChild(tag);
    return () => {
        document.querySelector(`style[data-plugin-css="${pluginCss}"]`)?.remove();
    };
}
exports.inject = ['slots', 'connection'];
function apply(ctx) {
    const slots = ctx.get?.('slots');
    if (!slots?.inject || !slots?.register)
        return;
    const rpcCall = makeRpcCall(ctx);
    ctx.effect(() => (0, settings_nav_icon_js_1.registerSettingsNavIcon)(() => 'Maestro Notifier'), 'maestro-notifier: settings nav icon');
    ctx.effect(() => installStyleTag(NOTIFIER_NAV_CSS, 'maestro-notifier/settings-nav.css'), 'maestro-notifier: settings nav css');
    ctx.effect(() => installStyleTag(styles_js_1.NOTIFIER_CSS, 'maestro-notifier/settings.css'), 'maestro-notifier: settings css');
    ctx.effect(() => {
        const dispose = slots.inject('settings.section', () => slots.register({
            name: 'settings.section',
            id: 'maestro-notifier',
            order: 33,
            label: () => 'Maestro Notifier',
            inject: () => ({ rpcCall }),
        }, (props) => React.createElement(NotifierSettings_js_1.NotifierSettings, props)));
        return () => {
            try {
                ;
                dispose?.();
            }
            catch {
                // Teardown must never throw.
            }
        };
    }, 'maestro-notifier: settings');
}
exports.default = { inject: exports.inject, apply };
//# sourceMappingURL=index.js.map