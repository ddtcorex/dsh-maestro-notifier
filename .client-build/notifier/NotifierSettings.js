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
exports.NotifierSettings = NotifierSettings;
/**
 * The Telegram target `dsh-maestro-notifier` owns.
 *
 * The bot token never comes back from the server: `getConfig` answers
 * `hasBotToken` instead of the value. A blank field keeps what is stored, a
 * filled field replaces it, and clearing happens server-side.
 */
const React = __importStar(require("react"));
function Field(props) {
    return React.createElement('div', { 'data-notifier-field': '' }, React.createElement('label', { 'data-notifier-label': '' }, props.label), props.children, props.hint ? React.createElement('p', { 'data-notifier-hint': '' }, props.hint) : null);
}
function NotifierSettings(props) {
    const { rpcCall } = props;
    const [cfg, setCfg] = React.useState({});
    const [botToken, setBotToken] = React.useState('');
    const [chatId, setChatId] = React.useState('');
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState(null);
    const fail = React.useCallback((e) => {
        setNotice({ tone: 'bad', text: e instanceof Error ? e.message : String(e) });
    }, []);
    const refresh = React.useCallback(async () => {
        setBusy(true);
        try {
            setCfg((await rpcCall('getConfig')) ?? {});
        }
        catch (e) {
            fail(e);
        }
        finally {
            setBusy(false);
        }
    }, [rpcCall, fail]);
    React.useEffect(() => {
        void refresh();
    }, [refresh]);
    const save = React.useCallback(async (patch) => {
        setBusy(true);
        try {
            await rpcCall('saveConfig', patch);
            // Clear the local field only after the save landed; otherwise a failed
            // save would silently discard what was just typed.
            if ('telegram' in patch)
                setBotToken('');
            setNotice({ tone: 'ok', text: 'Saved.' });
            await refresh();
        }
        catch (e) {
            fail(e);
        }
        finally {
            setBusy(false);
        }
    }, [rpcCall, refresh, fail]);
    const telegram = cfg.telegram ?? {};
    return React.createElement('div', { 'data-notifier-root': '' }, React.createElement('h2', { 'data-notifier-title': '' }, 'Notifications'), notice
        ? React.createElement('p', { 'data-notifier-notice': '', 'data-tone': notice.tone, role: 'status' }, notice.text)
        : null, React.createElement('div', { 'data-notifier-actions': '' }, React.createElement('button', { type: 'button', disabled: busy, onClick: () => void refresh() }, 'Refresh')), Field({
        label: 'Bot token',
        hint: telegram.hasBotToken === true ? 'A token is stored. Leave blank to keep it.' : 'Not set.',
        children: React.createElement('input', {
            type: 'password',
            value: botToken,
            placeholder: telegram.hasBotToken === true ? 'stored — type to replace' : 'not set',
            disabled: busy,
            autoComplete: 'new-password',
            'data-notifier-secret': 'botToken',
            onChange: (e) => setBotToken(e.target.value),
        }),
    }), Field({
        label: 'Chat id',
        hint: 'The Telegram chat that receives digests and PIN notices.',
        children: React.createElement('input', {
            type: 'text',
            value: chatId || String(telegram.chatId ?? ''),
            placeholder: '-1001234567890',
            disabled: busy,
            'data-notifier-input': 'chatId',
            onChange: (e) => setChatId(e.target.value),
            onBlur: () => void save({ telegram: { chatId: chatId || String(telegram.chatId ?? '') } }),
        }),
    }), React.createElement('button', {
        type: 'button',
        disabled: busy || botToken === '',
        'data-notifier-save': 'botToken',
        onClick: () => void save({ telegram: { botToken } }),
    }, 'Save token'), Field({
        label: 'Review notifications',
        children: React.createElement('input', {
            type: 'checkbox',
            checked: cfg.policy?.reviewNotifications === true,
            disabled: busy,
            'aria-label': 'Review notifications',
            'data-notifier-toggle': 'reviewNotifications',
            onChange: (e) => void save({ policy: { reviewNotifications: e.target.checked } }),
        }),
    }));
}
//# sourceMappingURL=NotifierSettings.js.map