import colors from './colors.js';
import { getModel, getBranch, getCwdName, getContext, getQuota } from './data.js';
import { formatNumber, pctColor, bar, formatTime, formatDayTime } from './format.js';

function quota(payload, provider, label, labelColor) {
  const q = getQuota(payload, provider);
  if (!q) return '';
  const part = (tag, bucket, fmt) =>
    bucket
      ? `${colors.white(tag)} ${pctColor(bucket.usedPct)(`${bucket.usedPct}%`)}` +
        (bucket.resetAt ? ` ${colors.dim('@' + fmt(bucket.resetAt))}` : '')
      : null;
  const parts = [part('5h', q.h5, formatTime), part('7d', q.weekly, formatDayTime)].filter(Boolean);
  return `${labelColor(label)}${colors.dim('·')}${parts.join(colors.dim(', '))}`;
}

const str = (v) => (typeof v === 'string' && v ? v : null);
const def = (priority, render) => ({ priority, render });

// priority: higher = kept longer when the line is too wide.
export const SEGMENTS = {
  model: def(10, (p) => (getModel(p) ? colors.blue(getModel(p)) : '')),
  context: def(9, (p) => {
    const c = getContext(p);
    if (!c) return '';
    const pct = Math.round(c.pct);
    return `${colors.orange(`${formatNumber(c.used)}/${formatNumber(c.total)}`)} ${colors.dim('(')}${pctColor(pct)(`${pct}%`)}${colors.dim(')')}`;
  }),
  context_bar: def(8, (p) => {
    const c = getContext(p);
    return c
      ? `${colors.dim('[')}${bar(c.pct, 10)}${colors.dim(']')} ${pctColor(c.pct)(`${Math.round(c.pct)}%`)}`
      : '';
  }),
  quota_gemini: def(8, (p) => quota(p, 'gemini', 'G', colors.googleBlue)),
  quota_3p: def(7, (p) => quota(p, '3p', '3P', colors.claudeOrange)),
  cwd_branch: def(6, (p) => {
    const branch = getBranch(p);
    const cwd = colors.cyan(getCwdName(p));
    return branch ? `${cwd}${colors.dim('@')}${colors.green(branch)}` : cwd;
  }),
  cwd: def(5, (p) => colors.cyan(getCwdName(p))),
  branch: def(5, (p) => (getBranch(p) ? colors.green(getBranch(p)) : '')),
  agent_state: def(4, (p) => (str(p?.agent_state) ? colors.purple(p.agent_state) : '')),
  exceeds_200k: def(4, (p) => (p?.exceeds_200k_tokens === true ? colors.red('⚠ >200k') : '')),
  sandbox: def(3, (p) => (p?.sandbox?.enabled === true ? '🔒' : '')),
  flags: def(4, (p) =>
    [SEGMENTS.sandbox.render(p), SEGMENTS.exceeds_200k.render(p)].filter(Boolean).join(' ')
  ),
  output_tokens: def(3, (p) => {
    const n = p?.context_window?.total_output_tokens;
    return typeof n === 'number' && n > 0 ? colors.dim(`out ${formatNumber(n)}`) : '';
  }),
  plan_tier: def(2, (p) => (str(p?.plan_tier) ? colors.yellow(p.plan_tier) : '')),
  product: def(2, (p) => (str(p?.product) ? colors.cyan(p.product) : '')),
  session_id_short: def(2, (p) =>
    str(p?.session_id) ? colors.dim(`#${p.session_id.slice(0, 8)}`) : ''
  ),
  email_masked: def(2, (p) => {
    const email = str(p?.email);
    if (!email || !email.includes('@')) return '';
    const [user, domain] = email.split('@');
    return colors.dim(`${user[0]}***@${domain}`);
  }),
  email: def(2, (p) => (str(p?.email) ? colors.dim(p.email) : '')),
  version: def(1, (p) => (str(p?.version) ? colors.orange(`v${p.version}`) : '')),
};

export const ALIASES = {
  tokens: 'context',
  quota_anthropic: 'quota_3p',
  quota_openai: 'quota_3p',
  extras: 'flags',
  session_id: 'session_id_short',
};

// Top-level keys agy sends (docs/agy-contract.md); usable directly as segments.
const PAYLOAD_KEYS = new Set([
  'cwd',
  'session_id',
  'conversation_id',
  'transcript_path',
  'model',
  'workspace',
  'version',
  'context_window',
  'exceeds_200k_tokens',
  'product',
  'quota',
  'agent_state',
  'sandbox',
  'plan_tier',
  'email',
  'terminal_width',
  'vcs',
]);
const BLOCKED = new Set(['__proto__', 'prototype', 'constructor']);

function payloadPathSegment(name) {
  const parts = name.split('.');
  if (parts.some((part) => !part || BLOCKED.has(part))) return null;
  return {
    name,
    priority: 5,
    render: (payload) => {
      let value = payload;
      for (const part of parts) value = value == null ? undefined : value[part];
      return value == null || typeof value === 'object' ? '' : String(value);
    },
  };
}

export function resolveSegment(name) {
  const key = ALIASES[name] ?? name;
  if (Object.hasOwn(SEGMENTS, key)) return { name: key, ...SEGMENTS[key] };
  if (name.includes('.') || PAYLOAD_KEYS.has(name)) return payloadPathSegment(name);
  return null;
}

export function isKnownSegment(name) {
  return resolveSegment(name) !== null;
}
