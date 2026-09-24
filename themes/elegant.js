// Quiet and compact: dim labels, 5h quota only.
const quota5h = (label, provider, priority) => ({
  name: `quota_${provider}`,
  priority,
  render: (p, { data, colors, format }) => {
    const q = data.getQuota(p, provider)?.h5;
    return q ? `${colors.dim(label)} ${format.pctColor(q.usedPct)(`${q.usedPct}%`)}` : '';
  },
});

export default {
  separator: '\x1b[2m ∘ \x1b[0m',
  segments: [
    'model',
    'branch',
    {
      name: 'context',
      priority: 9,
      render: (p, { data, colors, formatNumber }) => {
        const c = data.getContext(p);
        return c
          ? `${colors.dim('ctx')} ${colors.white(formatNumber(c.used))} ${colors.dim(`${Math.round(c.pct)}%`)}`
          : '';
      },
    },
    quota5h('g', 'gemini', 8),
    quota5h('3p', '3p', 7),
    'version',
  ],
};
