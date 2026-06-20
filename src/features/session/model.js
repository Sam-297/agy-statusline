import colors from '../../core/colors.js';

export function renderModel(payload) {
  if (!payload?.model?.display_name) return '';
  return colors.blue(payload.model.display_name);
}
