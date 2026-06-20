import colors from '../../core/colors.js';

export function formatNumber(num) {
  const abs = Math.abs(num);
  if (abs >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (abs >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return num.toString();
}

export function renderTokens(payload) {
  const cw = payload?.context_window;
  if (!cw || typeof cw.total_input_tokens !== 'number' || !cw.context_window_size) return '';
  
  const input = cw.total_input_tokens;
  const output = cw.total_output_tokens || 0;
  const used = input + output;
  const total = cw.context_window_size;
  if (total === 0) return '';
  
  const usedPct = Math.round((used / total) * 100);
  
  let colorFn = colors.green;
  if (usedPct >= 90) colorFn = colors.red;
  else if (usedPct >= 70) colorFn = colors.orange;
  else if (usedPct >= 50) colorFn = colors.yellow;

  return `${colors.orange(`${formatNumber(used)}/${formatNumber(total)}`)} ${colors.dim('(')}${colorFn(`${usedPct}%`)}${colors.dim(')')}`;
}
