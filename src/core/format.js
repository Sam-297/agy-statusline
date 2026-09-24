import colors from './colors.js';

export function formatNumber(num) {
  if (!Number.isFinite(num)) return '0';
  const abs = Math.abs(num);
  if (abs >= 1e6) return (num / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1e3) return (num / 1e3).toFixed(1).replace(/\.0$/, '') + 'k';
  return String(num);
}

export function pctColor(pct) {
  if (pct >= 90) return colors.red;
  if (pct >= 70) return colors.orange;
  if (pct >= 50) return colors.yellow;
  return colors.green;
}

export function bar(pct, length = 10, { full = '█', empty = '░' } = {}) {
  const clamped = Math.min(100, Math.max(0, Number(pct) || 0));
  const filled = Math.round((clamped / 100) * length);
  return pctColor(clamped)(full.repeat(filled)) + colors.dim(empty.repeat(length - filled));
}

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hourCycle: 'h23',
  hour: '2-digit',
  minute: '2-digit',
});
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

export function formatTime(date) {
  return timeFormatter.format(date);
}

export function formatDayTime(date) {
  return `${dayFormatter.format(date)} ${timeFormatter.format(date)}`;
}
