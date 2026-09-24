// Neon magenta/cyan. Real data only.
const neon = (code) => (s) => `\x1b[${code};1m${s}\x1b[0m`;
const magenta = neon(35);
const cyan = neon(36);
const yellow = neon(33);

const quota = (label, provider, priority) => ({
  name: `quota_${provider}`,
  priority,
  render: (p, { data }) => {
    const q = data.getQuota(p, provider)?.h5;
    return q ? `${magenta(label)}${cyan(`:${q.usedPct}%`)}` : '';
  },
});

export default {
  separator: '\x1b[35m ▓▒░ \x1b[0m',
  segments: [
    {
      name: 'model',
      priority: 10,
      render: (p, { data }) =>
        data.getModel(p) ? `${magenta('▲')} ${cyan(data.getModel(p))}` : '',
    },
    {
      name: 'branch',
      priority: 5,
      render: (p, { data }) =>
        data.getBranch(p) ? `${magenta('⎇')} ${yellow(data.getBranch(p))}` : '',
    },
    {
      name: 'context',
      priority: 9,
      render: (p, { data, format }) => {
        const c = data.getContext(p);
        return c
          ? `${cyan('MEM[')}${format.bar(c.pct, 10)}${cyan(']')} ${yellow(`${c.pct.toFixed(1)}%`)}`
          : '';
      },
    },
    quota('G', 'gemini', 8),
    quota('3P', '3p', 7),
    {
      name: 'version',
      priority: 1,
      render: (p) =>
        p?.version ? `${magenta('►')}${cyan('CYBER.NET')} ${yellow(`v${p.version}`)}` : '',
    },
  ],
};
