// Multi-line dashboard. Lines are truncated to the terminal width by the renderer.
// No email or session id: add the email_masked / session_id_short segments to your config if you want them.
export default {
  separator: '\n',
  segments: [
    {
      name: 'dashboard',
      priority: 10,
      render: (p, { data, colors, format, formatNumber, displayWidth, width }) => {
        const w = Math.min(100, width);
        const frame = colors.purple;
        const sep = colors.dim(' | ');

        const model = data.getModel(p);
        const header = [
          p?.product && p?.version ? colors.cyan(`${p.product} v${p.version}`) : null,
          p?.plan_tier ? colors.yellow(`[${p.plan_tier}]`) : null,
          model ? colors.blue(model) : null,
        ]
          .filter(Boolean)
          .join(` ${colors.dim('::')} `);

        const branch = data.getBranch(p);
        const status = [
          p?.agent_state ? `${colors.dim('state')} ${colors.purple(p.agent_state)}` : null,
          branch ? `${colors.dim('⎇')} ${colors.green(branch)}` : null,
          p?.sandbox?.enabled ? colors.green('sandbox') : null,
          p?.exceeds_200k_tokens ? colors.red('⚠ >200k') : null,
        ]
          .filter(Boolean)
          .join(sep);

        const c = data.getContext(p);
        const context = c
          ? `${colors.dim('[')}${format.bar(c.pct, 20)}${colors.dim(']')} ${formatNumber(c.used)}/${formatNumber(c.total)} ${colors.dim(`(${Math.round(c.pct)}%)`)}`
          : colors.dim('context: waiting for the first turn');

        const quotas = [
          ['G', 'gemini', colors.googleBlue],
          ['3P', '3p', colors.claudeOrange],
        ]
          .map(([label, provider, color]) => {
            const q = data.getQuota(p, provider);
            if (!q) return null;
            const parts = [
              q.h5 && `5h ${format.pctColor(q.h5.usedPct)(`${q.h5.usedPct}%`)}`,
              q.weekly && `7d ${format.pctColor(q.weekly.usedPct)(`${q.weekly.usedPct}%`)}`,
            ].filter(Boolean);
            return `${color(label)} ${parts.join(colors.dim(' · '))}`;
          })
          .filter(Boolean)
          .join('  ');

        const footer = `${frame('╰─')} ${quotas}`;
        const fill = Math.max(1, w - displayWidth(footer) - 2);
        return [
          `${frame('╭─')} ${header}`,
          `${frame('├─')} ${status}`,
          `${frame('├─')} ${context}`,
          `${footer} ${frame('─'.repeat(fill))}`,
        ].join('\n');
      },
    },
  ],
};
