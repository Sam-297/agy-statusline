export default {
  separator: "\n",
  segments: [
    (payload, utils) => {
      const strip = (s) => s.replace(/\x1B\[\d+(;\d+)*m/g, '');
      const width = Math.min(100, (payload?.terminal_width || 80) - 2);
      
      const model = payload?.model?.display_name || "Unknown";
      const branch = payload?.git?.branch;
      const cw = payload?.context_window || {};
      const used = (cw.total_input_tokens || 0) + (cw.total_output_tokens || 0);
      const total = cw.context_window_size || 1;
      const pct = used / total;
      
      const email = payload?.email || 'local';
      const sessionId = payload?.session_id || 'none';
      const state = payload?.agent_state || 'idle';
      const tier = payload?.plan_tier || 'free';
      const product = payload?.product || 'agy';
      const version = payload?.version || "1.0.0";
      const artifacts = payload?.artifact_count || 0;
      const confirm = payload?.tool_confirmation_pending ? utils.colors.orange(' ⚡CONFIRM ') : '';
      const sandbox = payload?.sandbox?.enabled ? '🔒' : '';
      
      const barLen = 20;
      const filled = Math.round(pct * barLen);
      const empty = Math.max(0, barLen - filled);
      const bar = '█'.repeat(filled) + '░'.repeat(empty);
      
      let coloredBar = utils.colors.green(bar);
      if (pct >= 0.9) coloredBar = utils.colors.red(bar);
      else if (pct >= 0.7) coloredBar = utils.colors.orange(bar);
      else if (pct >= 0.5) coloredBar = utils.colors.yellow(bar);

      const headerL = `${utils.colors.purple('╭─')} ${utils.colors.cyan(product + ' v' + version)} ${utils.colors.dim('::')} ${utils.colors.yellow('[' + tier + ']')} ${utils.colors.blue(model)}`;
      
      const identity = `${utils.colors.dim('👤')} ${email} ${utils.colors.dim('|')} ID:${sessionId} ${utils.colors.dim('|')} State: ${utils.colors.purple(state)}`;
      const l2 = `${utils.colors.purple('├─')} ${identity}${confirm}${sandbox}`;
      
      const gitInfo = branch ? ` ${utils.colors.green(' ' + branch)} ` : ' ';
      const usageText = `${utils.formatNumber ? utils.formatNumber(used) : used}/${utils.formatNumber ? utils.formatNumber(total) : total}`;
      const l3 = `${utils.colors.purple('├─')}${gitInfo}${utils.colors.dim('[')}${coloredBar}${utils.colors.dim(']')} ${usageText} ${utils.colors.dim('|')} 📦${artifacts}`;
      
      let quotas = '';
      if (payload?.quota) {
         const qg = payload.quota['gemini-5h'];
         const qa = payload.quota['3p-5h'] || payload.quota['anthropic-5h'];
         if (qg) quotas += `${utils.colors.blue('G:')}${Math.round(qg.remaining_fraction*100)}% `;
         if (qa) quotas += `${utils.colors.orange('C:')}${Math.round(qa.remaining_fraction*100)}% `;
      }
      
      const footerL = `${utils.colors.purple('╰─')} ${quotas}`;
      const footerR = utils.colors.dim('→');
      
      // Calculate true visual width accounting for emojis
      // 👤 and 📦 usually take 2 columns.
      let emojiOffset = 0;
      if (footerL.includes('👤')) emojiOffset += 1;
      if (footerL.includes('📦')) emojiOffset += 1;
      
      const leftLen = strip(footerL).length - emojiOffset;
      const rightLen = strip(footerR).length;
      const space = Math.max(1, width - leftLen - rightLen - 1);
      const filler = utils.colors.purple('─'.repeat(space));
      
      const footer = `${footerL}${filler} ${footerR}`;

      return `${headerL}\n${l2}\n${l3}\n${footer}`;
    }
  ]
};
