import colors from '../../core/colors.js';

export function renderVersion(payload) {
  if (!payload?.version) return '';
  return colors.orange(`agy v${payload.version}`);
}
