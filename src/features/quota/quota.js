import colors from '../../core/colors.js';

function colorizePct(remainingFraction, usedPct) {
  const text = `${usedPct}%`;
  if (usedPct >= 90) return colors.red(text);
  if (usedPct >= 70) return colors.orange(text);
  if (usedPct >= 50) return colors.yellow(text);
  return colors.green(text);
}

const timeFormatter = new Intl.DateTimeFormat('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
const dayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });

function defaultFormatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return timeFormatter.format(d);
}

function defaultFormatDayTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  return `${dayFormatter.format(d)} ${timeFormatter.format(d)}`;
}

export function renderQuota(payload, provider, utils = {}) {
  const q = payload?.quota;
  if (!q) return '';
  
  const h5Key = provider === 'gemini' ? 'gemini-5h' : '3p-5h';
  const weeklyKey = provider === 'gemini' ? 'gemini-weekly' : '3p-weekly';
  const prefix = provider === 'gemini' ? 'G' : provider === 'openai' ? 'O' : 'C';
  
  const h5 = q[h5Key];
  const weekly = q[weeklyKey];
  if (!h5 && !weekly) return '';

  const formatTime = utils.formatTime || defaultFormatTime;
  const formatDayTime = utils.formatDayTime || defaultFormatDayTime;
  
  const safeTime = (sec) => {
    if (typeof sec !== 'number' || isNaN(sec) || !isFinite(sec)) return null;
    return new Date(Date.now() + sec * 1000).toISOString();
  };
  
  let parts = [];
  if (h5) {
    const rem = typeof h5.remaining_fraction === 'number' && !isNaN(h5.remaining_fraction) ? h5.remaining_fraction : 0;
    const usedPct = Math.round((1 - rem) * 100);
    const resetTime = h5.reset_time || safeTime(h5.reset_in_seconds);
    const timeStr = resetTime ? '@' + formatTime(resetTime) : '';
    parts.push(`${colors.white('5h')} ${colorizePct(rem, usedPct)}${timeStr ? ' ' + colors.dim(timeStr) : ''}`);
  }
  if (weekly) {
    const rem = typeof weekly.remaining_fraction === 'number' && !isNaN(weekly.remaining_fraction) ? weekly.remaining_fraction : 0;
    const usedPct = Math.round((1 - rem) * 100);
    const resetTime = weekly.reset_time || safeTime(weekly.reset_in_seconds);
    const timeStr = resetTime ? '@' + formatDayTime(resetTime) : '';
    parts.push(`${colors.white('7d')} ${colorizePct(rem, usedPct)}${timeStr ? ' ' + colors.dim(timeStr) : ''}`);
  }
  
  let coloredPrefix = colors.claudeOrange(prefix);
  if (provider === 'gemini') coloredPrefix = colors.googleBlue(prefix);
  if (provider === 'openai') coloredPrefix = colors.openaiGreen(prefix);
  
  coloredPrefix += colors.dim('·');
  
  return `${coloredPrefix}${parts.join(colors.dim(', '))}`;
}
