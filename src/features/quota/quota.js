import colors from '../../core/colors.js';

function colorizePct(remainingFraction, usedPct) {
  const text = `${usedPct}%`;
  if (usedPct >= 90) return colors.red(text);
  if (usedPct >= 70) return colors.orange ? colors.orange(text) : colors.red(text);
  if (usedPct >= 50) return colors.yellow(text);
  return colors.green(text);
}

function defaultFormatTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function defaultFormatDayTime(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  const day = d.toLocaleDateString('en-US', { weekday: 'short' });
  const time = defaultFormatTime(isoStr);
  return `${day} ${time}`;
}

export function renderQuota(payload, provider, utils = {}) {
  const q = payload?.quota;
  if (!q) return '';
  
  const h5Key = provider === 'gemini' ? 'gemini-5h' : '3p-5h';
  const weeklyKey = provider === 'gemini' ? 'gemini-weekly' : '3p-weekly';
  const prefix = provider === 'gemini' ? 'G·' : 'C·';
  
  const h5 = q[h5Key];
  const weekly = q[weeklyKey];
  if (!h5 && !weekly) return '';

  const formatTime = utils.formatTime || defaultFormatTime;
  const formatDayTime = utils.formatDayTime || defaultFormatDayTime;
  
  let parts = [];
  if (h5) {
    const usedPct = Math.round((1 - h5.remaining_fraction) * 100);
    parts.push(`${colors.white('5h')} ${colorizePct(h5.remaining_fraction, usedPct)} ${colors.dim('@' + formatTime(h5.reset_time))}`);
  }
  if (weekly) {
    const usedPct = Math.round((1 - weekly.remaining_fraction) * 100);
    parts.push(`${colors.white('7d')} ${colorizePct(weekly.remaining_fraction, usedPct)} ${colors.dim('@' + formatDayTime(weekly.reset_time))}`);
  }
  
  const coloredPrefix = provider === 'gemini' ? colors.googleBlue(prefix) : colors.claudeOrange(prefix);
  return `${coloredPrefix}${parts.join(colors.dim(', '))}`;
}
