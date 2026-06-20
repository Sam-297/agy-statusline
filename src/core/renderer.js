import { renderModel } from '../features/session/model.js';
import { renderVersion } from '../features/session/version.js';
import { renderExtras } from '../features/session/extras.js';
import { renderCwdBranch, renderCwd, renderBranch } from '../features/git/cwd-branch.js';
import { renderTokens, formatNumber } from '../features/tokens/tokens.js';
import { renderQuota } from '../features/quota/quota.js';

import colors from './colors.js';

const SEGMENT_MAP = {
  model: (payload) => renderModel(payload),
  cwd_branch: (payload) => renderCwdBranch(payload),
  cwd: (payload) => renderCwd(payload),
  branch: (payload) => renderBranch(payload),
  tokens: (payload) => renderTokens(payload),
  quota_gemini: (payload) => renderQuota(payload, 'gemini'),
  quota_anthropic: (payload) => renderQuota(payload, 'anthropic'),
  quota_openai: (payload) => renderQuota(payload, 'openai'),
  version: (payload) => renderVersion(payload),
  extras: (payload) => renderExtras(payload),
  
  // Optional / Extra Segments
  email_masked: (payload) => {
    if (typeof payload?.email !== 'string') return '';
    const parts = payload.email.split('@');
    if (parts.length < 2) return colors.dim(payload.email);
    return colors.dim(parts[0][0] + '***@' + parts[1]);
  },
  email: (payload) => typeof payload?.email === 'string' ? colors.dim(payload.email) : '',
  session_id_short: (payload) => typeof payload?.session_id === 'string' ? colors.dim(`ID:${payload.session_id.substring(0, 8)}`) : '',
  session_id: (payload) => typeof payload?.session_id === 'string' ? colors.dim(`ID:${payload.session_id}`) : '',
  agent_state: (payload) => payload?.agent_state ? colors.purple(payload.agent_state) : '',
  plan_tier: (payload) => payload?.plan_tier ? colors.yellow(payload.plan_tier) : '',
  product: (payload) => payload?.product ? colors.cyan(payload.product) : '',
  artifact_count: (payload) => payload?.artifact_count ? `📦${payload.artifact_count}` : '',
  output_tokens: (payload) => payload?.context_window?.total_output_tokens ? colors.dim(`Out:${formatNumber(payload.context_window.total_output_tokens)}`) : '',
  sandbox: (payload) => payload?.sandbox?.enabled ? '🔒' : '',
  exceeds_200k: (payload) => payload?.exceeds_200k_tokens ? colors.red('⚠>200k') : ''
};

function getPayloadPath(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

const HIDE_PRIORITY = [
  'version',
  'quota_openai',
  'quota_anthropic',
  'quota_gemini',
  'cwd',
  'branch',
  'cwd_branch',
  'tokens',
  'model'
];

export function renderStatusLine(payload, config) {
  // Real utilities exposed to user custom segments
  const utils = { colors, formatNumber };
  let renderedSegments = [];

  for (const segment of config.segments) {
    let res = '';
    let name = typeof segment === 'string' ? segment : 'custom';
    
    if (typeof segment === 'function') {
      try {
        res = segment(payload, utils) || '';
      } catch (err) {
        res = colors.red(`[Error: ${err.message}]`);
      }
    } else if (SEGMENT_MAP[segment]) {
      res = SEGMENT_MAP[segment](payload) || '';
    } else if (typeof segment === 'string') {
      // Dynamic fallback: allow querying deep payload paths like "context_window.context_window_size"
      const val = getPayloadPath(payload, segment);
      if (val !== undefined && val !== null) {
        res = String(val);
      }
    }
    
    if (res) {
      renderedSegments.push({ name, res });
    }
  }
  
  // Safety margin of 2 columns to prevent auto-wrap on the exact last column
  const safeWidth = (payload?.terminal_width || process.stdout.columns || 80) - 2;
  
  const getVisibleLength = (segs) => {
    const raw = segs.map(s => s.res).join(config.separator);
    return colors.stripAnsi(raw).length;
  };

  while (renderedSegments.length > 0 && getVisibleLength(renderedSegments) > safeWidth) {
    let dropIndex = -1;
    for (const targetName of HIDE_PRIORITY) {
      const idx = renderedSegments.findIndex(s => s.name === targetName);
      if (idx !== -1) {
        dropIndex = idx;
        break;
      }
    }
    
    if (dropIndex === -1) {
      dropIndex = renderedSegments.length - 1;
    }
    
    renderedSegments.splice(dropIndex, 1);
  }

  return renderedSegments.map(s => s.res).join(config.separator);
}
