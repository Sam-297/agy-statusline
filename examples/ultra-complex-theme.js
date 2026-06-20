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
      
      const email = payload?.email ? payload.email.replace(/(.).*@/, '$1***@') : 'local';
      const sessionId = payload?.session_id ? payload.session_id.substring(0, 8) : 'none';
      const state = payload?.agent_state || 'idle';
      const tier = payload?.plan_tier || 'free';
      const product = payload?.product || 'agy';
      const artifacts = payload?.artifact_count || 0;
      const confirm = payload?.tool_confirmation_pending ? utils.colors.orange(' ⚡CONFIRM ') : '';
      const sandbox = payload?.sandbox?.enabled ? '🔒' : '';
      
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
      
      // Line 1: Header (Product, Version, Tier, Model)
      const header = `${utils.colors.purple('╭─')} ${utils.colors.cyan(product + ' v' + version)} ${utils.colors.dim('::')} ${utils.colors.yellow('[' + tier + ']')} ${utils.colors.blue(model)}`;
      
      // Line 2: Identity & State
      const identity = `${utils.colors.dim('👤')} ${email} ${utils.colors.dim('|')} ID:${sessionId} ${utils.colors.dim('|')} State: ${utils.colors.purple(state)}`;
      const l2 = `${utils.colors.purple('├─')} ${identity}${confirm}${sandbox}`;
      
      // Line 3: Git & Tokens & Artifacts
      const gitInfo = branch ? ` ${utils.colors.green(' ' + branch)} ` : ' ';
      const usageText = `${utils.formatNumber(used)}/${utils.formatNumber(total)}`;
      const l3 = `${utils.colors.purple('├─')}${gitInfo}${utils.colors.dim('[')}${coloredBar}${utils.colors.dim(']')} ${usageText} ${utils.colors.dim('|')} 📦${artifacts}`;
      
      // Line 4: Quotas & Prompt arrow
      let quotas = '';
      if (payload?.quota) {
         const qg = payload.quota['gemini-5h'];
         const qa = payload.quota['anthropic-5h'];
         if (qg) quotas += `${utils.colors.googleBlue('G:')}${Math.round((1 - qg.remaining_fraction)*100)}% `;
         if (qa) quotas += `${utils.colors.claudeOrange('C:')}${Math.round((1 - qa.remaining_fraction)*100)}% `;
      }
      const footer = `${utils.colors.purple('╰─')} ${quotas}${utils.colors.dim('→')}`;

      // Return the multi-line string joined by true newlines
      return `${header}\n${l2}\n${l3}\n${footer}`;
    }
  ]
};
