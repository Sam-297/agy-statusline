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

// Hand-rolled instead of Intl.DateTimeFormat, which costs ~4 ms to construct on every render.
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const pad = (n) => String(n).padStart(2, '0');

export function formatTime(date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDayTime(date) {
  return `${DAYS[date.getDay()]} ${formatTime(date)}`;
}
