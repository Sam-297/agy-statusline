export default {
  separator: "\x1B[2m ∘ \x1B[0m",
  segments: [
    (payload, utils) => {
      const model = payload?.model?.display_name || "Unknown";
      return utils.colors.cyan(model);
    },
    (payload, utils) => {
      const branch = payload?.git?.branch;
      if (!branch) return '';
      return `${utils.colors.dim('⎇')} ${utils.colors.white(branch)}`;
    },
    (payload, utils) => {
      const cw = payload?.context_window;
      if (!cw) return '';
      const used = (cw.total_input_tokens || 0) + (cw.total_output_tokens || 0);
      const total = cw.context_window_size || 1;
      const pct = Math.round((used / total) * 100);
      
      const usageText = utils.formatNumber ? utils.formatNumber(used) : used.toLocaleString();
      return `${utils.colors.dim('ctx')} ${utils.colors.white(usageText)} ${utils.colors.dim(pct + '%')}`;
    },
    (payload, utils) => {
      if (!payload?.quota) return '';
      let out = [];
      const qg = payload.quota['gemini-5h'];
      if (qg) {
        const remaining = Math.round(qg.remaining_fraction * 100);
        out.push(`${utils.colors.dim('g')} ${utils.colors.white(remaining + '%')}`);
      }
      const qa = payload.quota['3p-5h'] || payload.quota['anthropic-5h'];
      if (qa) {
        const remaining = Math.round(qa.remaining_fraction * 100);
        out.push(`${utils.colors.dim('a')} ${utils.colors.white(remaining + '%')}`);
      }
      return out.length > 0 ? out.join(utils.colors.dim(' ∘ ')) : '';
    },
    (payload, utils) => {
      const version = payload?.version || "1.0.0";
      return utils.colors.dim(`v${version}`);
    }
  ]
};
