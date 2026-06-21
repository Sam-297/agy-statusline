export default {
  separator: "\x1B[32m▒\x1B[0m",
  segments: [
    function sysVersion(payload, utils) {
      const v = payload?.version || "1.0";
      return `\x1B[42;30m SYS.v${v} \x1B[0m`;
    },
    function sysModel(payload, utils) {
      const model = payload?.model?.display_name?.toUpperCase() || "SYS";
      return `\x1B[1;32m ${model} \x1B[0m`;
    },
    function sysState(payload, utils) {
      const state = payload?.agent_state?.toUpperCase() || 'IDLE';
      const c = payload?.tool_confirmation_pending ? `\x1B[5;32m>>INPUT<<\x1B[0m ` : '';
      return ` \x1B[2;32m[\x1B[0m\x1B[1;32m${c}${state}\x1B[0m\x1B[2;32m]\x1B[0m `;
    },
    function sysMem(payload, utils) {
      const cw = payload?.context_window || {};
      const used = (cw.total_input_tokens || 0) + (cw.total_output_tokens || 0);
      const total = cw.context_window_size || 1;
      const pct = used / total;
      
      const barLen = 10;
      const filled = Math.round(pct * barLen);
      const empty = Math.max(0, barLen - filled);
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      return ` \x1B[2;32mMEM[\x1B[0m\x1B[1;32m${bar}\x1B[0m\x1B[2;32m]\x1B[0m\x1B[1;32m${utils.formatNumber(used)}/${utils.formatNumber(total)}B\x1B[0m `;
    },
    function sysNet(payload, utils) {
      let quotas = '';
      if (payload?.quota) {
         const qg = payload.quota['gemini-5h'];
         const qa = payload.quota['3p-5h'] || payload.quota['anthropic-5h'];
         if (qg) quotas += `\x1B[2;32mG:\x1B[0m\x1B[1;32m${Math.round((1 - qg.remaining_fraction)*100)}%\x1B[0m `;
         if (qa) quotas += `\x1B[2;32mC:\x1B[0m\x1B[1;32m${Math.round((1 - qa.remaining_fraction)*100)}%\x1B[0m `;
      }
      return quotas ? ` ${quotas}` : ' \x1B[2;32mNET:OK\x1B[0m ';
    }
  ]
};
