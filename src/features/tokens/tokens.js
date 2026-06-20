import colors from '../../core/colors.js';

export function renderTokens(payload) {
  const cw = payload?.context_window;
  if (!cw || typeof cw.total_input_tokens !== 'number' || !cw.context_window_size) return '';
  
  const input = cw.total_input_tokens;
  const output = cw.total_output_tokens || 0;
  const used = input + output;
  const total = cw.context_window_size;
  
  const usedPct = Math.round((used / total) * 100);
  const remainingFraction = 1 - (used / total);
  
  const text = `${used}/${total} (${usedPct}%)`;
  
  if (remainingFraction < 0.2) return colors.red(text);
  if (remainingFraction < 0.5) return colors.yellow(text);
  return colors.green(text);
}
