import { renderModel } from '../features/session/model.js';
import { renderVersion } from '../features/session/version.js';
import { renderExtras } from '../features/session/extras.js';
import { renderCwdBranch, renderCwd, renderBranch } from '../features/git/cwd-branch.js';
import { renderTokens, formatNumber } from '../features/tokens/tokens.js';
import { renderQuota } from '../features/quota/quota.js';

import colors from './colors.js';

const SEGMENT_MAP = {
  model: (payload, utils) => renderModel(payload, utils),
  cwd_branch: (payload, utils) => renderCwdBranch(payload, utils),
  cwd: (payload, utils) => renderCwd(payload, utils),
  branch: (payload, utils) => renderBranch(payload, utils),
  tokens: (payload, utils) => renderTokens(payload, utils),
  quota_gemini: (payload, utils) => renderQuota(payload, 'gemini', utils),
  quota_anthropic: (payload, utils) => renderQuota(payload, 'anthropic', utils),
  quota_openai: (payload, utils) => renderQuota(payload, 'openai', utils),
  version: (payload, utils) => renderVersion(payload, utils),
  extras: (payload, utils) => renderExtras(payload, utils),
  
  // Optional / Extra Segments
  email_masked: (payload) => {
    if (typeof payload?.email !== 'string') return '';
    const parts = payload.email.split('@');
    if (parts.length < 2) return colors.dim(payload.email);
    return colors.dim(parts[0][0] + '***@' + parts[1]);
  },
  email: (payload) => typeof payload?.email === 'string' ? colors.dim(payload.email) : '',
  session_id_short: (payload) => typeof payload?.session_id === 'string' ? colors.dim(`ID:s***`) : '',
  session_id: (payload) => typeof payload?.session_id === 'string' ? colors.dim(`ID:s***`) : '',
  agent_state: (payload) => payload?.agent_state ? colors.purple(payload.agent_state) : '',
  plan_tier: (payload) => payload?.plan_tier ? colors.yellow(payload.plan_tier) : '',
  product: (payload) => payload?.product ? colors.cyan(payload.product) : '',
  artifact_count: (payload) => payload?.artifact_count ? `📦${payload.artifact_count}` : '',
  output_tokens: (payload) => payload?.context_window?.total_output_tokens ? colors.dim(`Out:${formatNumber(payload.context_window.total_output_tokens)}`) : '',
  sandbox: (payload) => payload?.sandbox?.enabled ? '🔒' : '',
  exceeds_200k: (payload) => payload?.exceeds_200k_tokens ? colors.red('⚠>200k') : ''
};

function getPayloadPath(obj, path) {
  return path.split('.').reduce((acc, part) => {
    if (part === '__proto__' || part === 'constructor' || part === 'prototype') return undefined;
    return acc == null ? undefined : acc[part];
  }, obj);
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

export async function renderStatusLine(payload, config) {
  // Real utilities exposed to user custom segments
  const utils = { colors, formatNumber };
  let renderedSegments = [];
  
  if (!Array.isArray(config.segments)) config.segments = ['cwd_branch'];

  for (const segment of config.segments) {
    let res = '';
    let name = typeof segment === 'string' ? segment : 'custom';
    
    if (typeof segment === 'function') {
      try {
        res = (await segment(payload, utils)) || '';
      } catch (err) {
        res = colors.red(`[Error: ${err.message}]`);
      }
    } else if (SEGMENT_MAP[segment]) {
      try {
        res = (await SEGMENT_MAP[segment](payload, utils)) || '';
      } catch (err) {
        res = colors.red(`[Error: ${err.message}]`);
      }
    } else if (typeof segment === 'string') {
      // Dynamic fallback: allow querying deep payload paths like "context_window.context_window_size"
      const val = getPayloadPath(payload, segment);
      if (val !== undefined && val !== null) {
        res = String(val);
      }
    }
    
    if (res !== undefined && res !== null && res !== '') {
      res = String(res) + '\x1b[0m'; // Prevent color bleeding
      const strippedLines = colors.stripAnsi(res).split('\n');
      const visLen = Math.max(...strippedLines.map(l => Array.from(l).length)); // Fix ZWJ emoji length
      renderedSegments.push({ name, res, visLen });
    }
  }
  
  // Safety margin of 2 columns to prevent auto-wrap on the exact last column
  const payloadWidth = typeof payload?.terminal_width === 'number' ? payload.terminal_width : null;
  const safeWidth = payloadWidth === 0 ? Infinity : (payloadWidth || process.stdout.columns || 80) - 2;
  
  let sepStr = '';
  try { sepStr = String(config.separator); } catch(e) { sepStr = ' | '; }
  const separatorLength = Array.from(colors.stripAnsi(sepStr)).length;
  let totalLength = renderedSegments.reduce((acc, s) => acc + s.visLen, 0) + Math.max(0, renderedSegments.length - 1) * separatorLength;

  const priorityMap = new Map();
  HIDE_PRIORITY.forEach((name, idx) => priorityMap.set(name, idx));

  while (renderedSegments.length > 0 && totalLength > safeWidth) {
    let dropIndex = -1;
    let minPriority = Infinity;
    for (let i = 0; i < renderedSegments.length; i++) {
      const p = priorityMap.has(renderedSegments[i].name) ? priorityMap.get(renderedSegments[i].name) : Infinity;
      if (p < minPriority) {
        minPriority = p;
        dropIndex = i;
      }
    }
    
    if (dropIndex === -1 || minPriority === Infinity) {
      dropIndex = renderedSegments.length - 1;
    }
    
    const dropped = renderedSegments.splice(dropIndex, 1)[0];
    totalLength -= dropped.visLen;
    if (renderedSegments.length > 0) totalLength -= separatorLength;
  }

  return renderedSegments.map(s => s.res).join(config.separator);
}
