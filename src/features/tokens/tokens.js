import colors from '../../core/colors.js';

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

export function renderTokens(payload) {
  const cw = payload?.context_window;
  if (!cw || typeof cw.total_input_tokens !== 'number' || !cw.context_window_size) return '';
  
  const input = cw.total_input_tokens;
  const output = cw.total_output_tokens || 0;
  const used = input + output;
  const total = cw.context_window_size;
  
  const usedPct = Math.round((used / total) * 100);
  const text = `${formatNumber(used)}/${formatNumber(total)} (${usedPct}%)`;
  
  if (usedPct >= 90) return colors.red(text);
  if (usedPct >= 70) return colors.orange ? colors.orange(text) : colors.red(text);
  if (usedPct >= 50) return colors.yellow(text);
  return colors.green(text);
}
