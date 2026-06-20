import { renderModel } from '../features/session/model.js';
import { renderVersion } from '../features/session/version.js';
import { renderExtras } from '../features/session/extras.js';
import { renderCwdBranch } from '../features/git/cwd-branch.js';
import colors from './colors.js';
import { renderTokens, formatNumber } from '../features/tokens/tokens.js';
import { renderQuota } from '../features/quota/quota.js';

const SEGMENT_MAP = {
  model: (payload) => renderModel(payload),
  cwd_branch: (payload) => renderCwdBranch(payload),
  tokens: (payload) => renderTokens(payload),
  quota_gemini: (payload) => renderQuota(payload, 'gemini'),
  quota_anthropic: (payload) => renderQuota(payload, 'anthropic'),
  version: (payload) => renderVersion(payload),
  extras: (payload) => renderExtras(payload)
};

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
    }
  }
  return parts.join(config.separator);
}
