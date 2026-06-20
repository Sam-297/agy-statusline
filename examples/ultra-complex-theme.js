export default {
  // Use a minimal separator, or empty if we handle it in segments
  separator: " ",
  
  segments: [
    (payload, utils) => {
      // 1. Gather all data
      const model = payload?.model?.display_name || "Unknown";
      const branch = utils.getBranch ? utils.getBranch(process.cwd()) : null;
      const cw = payload?.context_window || {};
      const used = (cw.total_input_tokens || 0) + (cw.total_output_tokens || 0);
      const total = cw.context_window_size || 1;
      const pct = used / total;
      const version = payload?.version || "1.0.0";
      
      // 2. Draw a massive 20-char progress bar
      const barLen = 20;
      const filled = Math.round(pct * barLen);
      const empty = Math.max(0, barLen - filled);
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      let coloredBar = utils.colors.green(bar);
      if (pct >= 0.9) coloredBar = utils.colors.red(bar);
      else if (pct >= 0.7) coloredBar = utils.colors.orange(bar);
      else if (pct >= 0.5) coloredBar = utils.colors.yellow(bar);

      // 3. Construct a multi-line dashboard using ANSI layout
      // Line 1: Header
      const header = `${utils.colors.purple('╭─')} ${utils.colors.blue(model)} ${utils.colors.dim('::')} ${utils.colors.cyan('agy v' + version)}`;
      
      // Line 2: Git & Tokens
      const gitInfo = branch ? ` ${utils.colors.green(' ' + branch)} ` : '';
      const usageText = `${utils.formatNumber(used)}/${utils.formatNumber(total)}`;
      const middle = `${utils.colors.purple('├─')}${gitInfo}${utils.colors.dim('[')}${coloredBar}${utils.colors.dim(']')} ${usageText}`;
      
      // Line 3: Quotas & Prompt arrow
      let quotas = '';
      if (payload?.quota) {
         const qg = payload.quota['gemini-5h'];
         const qa = payload.quota['anthropic-5h'];
         if (qg) quotas += `${utils.colors.googleBlue('G:')}${Math.round(qg.remaining_fraction*100)}% `;
         if (qa) quotas += `${utils.colors.claudeOrange('C:')}${Math.round(qa.remaining_fraction*100)}% `;
      }
      const footer = `${utils.colors.purple('╰─')} ${quotas}${utils.colors.dim('→')}`;

      // Return the multi-line string joined by true newlines
      return `${header}\n${middle}\n${footer}`;
    }
  ]
};
