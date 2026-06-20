export default {
  // Use a clean dim separator
  separator: "\x1B[2m | \x1B[0m",
  
  segments: [
    "model",
    "cwd_branch",
    
    // A complex custom segment that draws a text progress bar for context tokens
    (payload, utils) => {
      const cw = payload?.context_window;
      if (!cw || !cw.context_window_size) return '';
      
      const used = cw.total_input_tokens + (cw.total_output_tokens || 0);
      const total = cw.context_window_size;
      const pct = used / total;
      
      // Draw a 10-character progress bar [████░░░░░░]
      const barLen = 10;
      const filled = Math.round(pct * barLen);
      const empty = Math.max(0, barLen - filled);
      
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      // Dynamic colors based on usage
      let coloredBar = utils.colors.green(bar);
      if (pct >= 0.9) coloredBar = utils.colors.red(bar);
      else if (pct >= 0.7) coloredBar = utils.colors.orange(bar);
      else if (pct >= 0.5) coloredBar = utils.colors.yellow(bar);

      const usageText = `${utils.formatNumber(used)}/${utils.formatNumber(total)}`;
      
      return `Context [${coloredBar}] ${utils.colors.dim(usageText)}`;
    },
    
    "quota_gemini",
    "version"
  ]
};
