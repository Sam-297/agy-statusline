// Green-phosphor terminal. Real data only.
const green = (s) => `\x1b[1;32m${s}\x1b[0m`;
const dimGreen = (s) => `\x1b[2;32m${s}\x1b[0m`;

export default {
  separator: '\x1b[32m ▒ \x1b[0m',
  segments: [
    {
      name: 'version',
      priority: 1,
      render: (p) => (p?.version ? `\x1b[42;30m SYS.v${p.version} \x1b[0m` : ''),
    },
    {
      name: 'model',
      priority: 10,
      render: (p, { data }) => (data.getModel(p) ? green(data.getModel(p).toUpperCase()) : ''),
    },
    {
      name: 'agent_state',
      priority: 4,
      render: (p) =>
        p?.agent_state
          ? `${dimGreen('[')}${green(p.agent_state.toUpperCase())}${dimGreen(']')}`
          : '',
    },
    {
      name: 'context',
      priority: 9,
      render: (p, { data, formatNumber }) => {
        const c = data.getContext(p);
        if (!c) return '';
        const filled = Math.min(10, Math.max(0, Math.round(c.pct / 10)));
        const meter = '█'.repeat(filled) + '░'.repeat(10 - filled);
        return `${dimGreen('MEM[')}${green(meter)}${dimGreen(']')} ${green(`${formatNumber(c.used)}/${formatNumber(c.total)}`)}`;
      },
    },
    {
      name: 'quota_gemini',
      priority: 8,
      render: (p, { data }) => {
        const parts = [
          ['G', 'gemini'],
          ['3P', '3p'],
        ]
          .map(([label, provider]) => [label, data.getQuota(p, provider)?.h5])
          .filter(([, q]) => q)
          .map(([label, q]) => `${label}:${q.usedPct}%`);
        return parts.length ? `${dimGreen('QUOTA')} ${green(parts.join(' '))}` : '';
      },
    },
  ],
};
