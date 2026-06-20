export default {
  separator: "\x1B[35m ▓▒░ \x1B[0m",
  segments: [
    (payload) => {
      const magenta = (s) => `\x1B[35;1m${s}\x1B[0m`;
      const cyan = (s) => `\x1B[36;1m${s}\x1B[0m`;
      const yellow = (s) => `\x1B[33;1m${s}\x1B[0m`;

      const version = payload?.version || '1.0';
      return `${magenta('►')}${cyan('CYBER.NET')} ${yellow('v'+version)}`;
    },
    (payload) => {
      const magenta = (s) => `\x1B[35;1m${s}\x1B[0m`;
      const cyan = (s) => `\x1B[36;1m${s}\x1B[0m`;
      const model = payload?.model?.display_name || "SYS_CORE";
      return `${magenta('▲')} ${cyan(model)}`;
    },
    (payload, utils) => {
      const magenta = (s) => `\x1B[35;1m${s}\x1B[0m`;
      const yellow = (s) => `\x1B[33;1m${s}\x1B[0m`;
      const branch = payload?.git?.branch || 'MAIN';
      return `${magenta('⎇')} ${yellow(branch)}`;
    },
    (payload) => {
      const magenta = (s) => `\x1B[35;1m${s}\x1B[0m`;
      const cyan = (s) => `\x1B[36;1m${s}\x1B[0m`;
      const yellow = (s) => `\x1B[33;1m${s}\x1B[0m`;
      
      const cw = payload?.context_window || {};
      let pct = 0;
      if (cw.context_window_size) {
        pct = ((cw.total_input_tokens || 0) + (cw.total_output_tokens || 0)) / cw.context_window_size;
      } else if (cw.used_percentage !== undefined) {
        pct = cw.used_percentage / 100;
      }
      
      const barLen = 10;
      const filled = Math.min(barLen, Math.round(pct * barLen));
      const empty = Math.max(0, barLen - filled);
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      return `${cyan('MEM[')}${magenta(bar)}${cyan(']')} ${yellow((pct*100).toFixed(1)+'%')}`;
    }
  ]
};
