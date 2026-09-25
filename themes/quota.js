// Quota first: bars for both providers' 5h and 7d windows, with reset times on wide terminals.
const WIDE_ENOUGH_FOR_RESET_TIMES = 150;

const bucket = (label, b, fmt, { colors, format }) =>
  b
    ? `${colors.dim(label)} ${format.bar(b.usedPct, 8)} ${format.pctColor(b.usedPct)(`${b.usedPct}%`)}` +
      (fmt && b.resetAt ? colors.dim(` ↻${fmt(b.resetAt)}`) : '')
    : null;

const provider = (name, label, pickColor, priority) => ({
  name: `quota_${name}`,
  priority,
  render: (p, utils) => {
    const q = utils.data.getQuota(p, name);
    if (!q) return '';
    const wide = utils.width >= WIDE_ENOUGH_FOR_RESET_TIMES;
    const parts = [
      bucket('5h', q.h5, wide && utils.format.formatTime, utils),
      bucket('7d', q.weekly, wide && utils.format.formatDayTime, utils),
    ].filter(Boolean);
    return `${pickColor(utils.colors)(label)} ${parts.join(utils.colors.dim(' · '))}`;
  },
});

export default {
  separator: '\x1b[2m │ \x1b[0m',
  segments: [
    'model',
    {
      name: 'context',
      priority: 9,
      render: (p, { data, colors, format }) => {
        const c = data.getContext(p);
        return c
          ? `${colors.dim('ctx')} ${format.bar(c.pct, 8)} ${format.pctColor(c.pct)(`${Math.round(c.pct)}%`)}`
          : '';
      },
    },
    provider('gemini', 'G', (c) => c.googleBlue, 8),
    provider('3p', '3P', (c) => c.claudeOrange, 7),
  ],
};
