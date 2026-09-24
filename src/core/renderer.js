import colors from './colors.js';
import * as data from './data.js';
import * as format from './format.js';
import { resolveSegment } from './segments.js';
import { displayWidth, stripAnsi, truncate } from './width.js';

export const SEGMENT_TIMEOUT_MS = 300;
const CUSTOM_PRIORITY = 5;
const WARNING_PRIORITY = 7;
const RESET = '\x1b[0m';
const TIMEOUT = Symbol('timeout');

export function maxWidthFor(payload) {
  const w = payload?.terminal_width;
  if (w === 0) return Infinity;
  // 2-column margin: avoids auto-wrap on the last column.
  return (typeof w === 'number' && w > 0 ? w : 80) - 2;
}

export function makeUtils(maxWidth) {
  return {
    colors,
    formatNumber: format.formatNumber,
    format,
    data,
    displayWidth,
    truncate,
    width: maxWidth,
  };
}

function toItem(segment, index) {
  if (typeof segment === 'string') {
    const builtin = resolveSegment(segment);
    return builtin && { ...builtin, index };
  }
  if (typeof segment === 'function') {
    return { name: segment.name || 'custom', priority: CUSTOM_PRIORITY, render: segment, index };
  }
  if (segment && typeof segment.render === 'function') {
    const priority = Number.isFinite(segment.priority) ? segment.priority : CUSTOM_PRIORITY;
    return { name: segment.name || 'custom', priority, render: segment.render, index };
  }
  return null;
}

async function runSegment(item, payload, utils, timeoutMs) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(resolve, timeoutMs, TIMEOUT);
  });
  try {
    const result = await Promise.race([
      Promise.resolve().then(() => item.render(payload, utils)),
      timeout,
    ]);
    if (result === TIMEOUT) return colors.red(`[${item.name}: timeout]`);
    return result == null || result === false ? '' : String(result);
  } catch (err) {
    return colors.red(`[${item.name}: ${err?.message ?? err}]`);
  } finally {
    clearTimeout(timer);
  }
}

// Lowest priority goes first; on a tie, the rightmost segment.
function pickDrop(items) {
  let drop = 0;
  for (let i = 1; i < items.length; i++) {
    const [a, b] = [items[i], items[drop]];
    if (a.priority < b.priority || (a.priority === b.priority && a.index >= b.index)) drop = i;
  }
  return drop;
}

export async function renderStatusLine(
  payload,
  config,
  { env = process.env, timeoutMs = SEGMENT_TIMEOUT_MS } = {}
) {
  const maxWidth = maxWidthFor(payload);
  const utils = makeUtils(maxWidth);
  const separator = typeof config.separator === 'string' ? config.separator : colors.dim(' | ');

  const items = (Array.isArray(config.segments) ? config.segments : []).map(toItem).filter(Boolean);
  const texts = await Promise.all(items.map((item) => runSegment(item, payload, utils, timeoutMs)));
  const rendered = items
    .map((item, i) => ({ ...item, text: texts[i] }))
    .filter((item) => item.text !== '')
    .map((item) => ({ ...item, text: item.text + RESET }));
  for (const warning of config.warnings ?? []) {
    rendered.push({
      name: 'warning',
      priority: WARNING_PRIORITY,
      index: Infinity,
      text: colors.yellow(`⚠ ${warning}`) + RESET,
    });
  }

  const join = (list) => list.map((item) => item.text).join(separator);
  if (!separator.includes('\n')) {
    while (rendered.length > 1 && displayWidth(join(rendered)) > maxWidth) {
      rendered.splice(pickDrop(rendered), 1);
    }
  }

  let out = join(rendered);
  if (Number.isFinite(maxWidth)) {
    out = out
      .split('\n')
      .map((line) => truncate(line, maxWidth))
      .join('\n');
  }
  if (env.NO_COLOR) out = stripAnsi(out);
  return out;
}
