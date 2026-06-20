import colors from '../../core/colors.js';

export function renderExtras(payload) {
  let flags = [];
  
  if (payload?.tool_confirmation_pending) {
    flags.push(colors.orange('⚡CONFIRM'));
  }
  if (Array.isArray(payload?.flags) && payload.flags.length > 0) {
    flags.push(...payload.flags);
  }
  if (payload?.sandbox?.enabled) {
    flags.push('🔒');
  }
  if (payload?.exceeds_200k_tokens) {
    flags.push(colors.red('⚠>200k'));
  }
  
  return flags.join(' ');
}
