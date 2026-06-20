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
  email_masked: (payload) => payload?.email ? colors.dim(payload.email.replace(/(.).*@/, '$1***@')) : '',
  email: (payload) => payload?.email ? colors.dim(payload.email) : '',
  session_id_short: (payload) => payload?.session_id ? colors.dim(`ID:${payload.session_id.substring(0, 8)}`) : '',
  session_id: (payload) => payload?.session_id ? colors.dim(`ID:${payload.session_id}`) : '',
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

export function renderStatusLine(payload, config) {
  const parts = [];
  
  // Real utilities exposed to user custom segments
  const utils = { colors, formatNumber };

  for (const segment of config.segments) {
    if (typeof segment === 'function') {
      const res = segment(payload, utils);
      if (res) parts.push(res);
    } else if (SEGMENT_MAP[segment]) {
      const res = SEGMENT_MAP[segment](payload);
      if (res) parts.push(res);
    } else if (typeof segment === 'string') {
      // Dynamic fallback: allow querying deep payload paths like "context_window.context_window_size"
      const val = getPayloadPath(payload, segment);
      if (val !== undefined && val !== null) {
        parts.push(String(val));
      }
    }
  }
  return parts.join(config.separator);
}
