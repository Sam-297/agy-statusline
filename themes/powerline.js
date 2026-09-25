// Powerline blocks (Starship / Powerlevel10k style).
// Needs a Nerd Font or Powerline-patched font for the arrow and branch glyphs.
const ARROW = String.fromCodePoint(0xe0b0);
const BRANCH = String.fromCodePoint(0xe0a0);
const INK = '\x1b[38;2;24;24;24m';
const rgb = ([r, g, b]) => `${r};${g};${b}`;
const block = (bg, text) =>
  `\x1b[48;2;${rgb(bg)}m${INK} ${text} \x1b[0m\x1b[38;2;${rgb(bg)}m${ARROW}\x1b[0m`;

const C = {
  blue: [97, 175, 239],
  cyan: [86, 182, 194],
  green: [152, 195, 121],
  yellow: [229, 192, 123],
  orange: [209, 154, 102],
  red: [224, 108, 117],
  gray: [140, 147, 160],
};
const level = (pct) => (pct >= 90 ? C.red : pct >= 70 ? C.orange : pct >= 50 ? C.yellow : C.green);

const quota = (name, label, priority) => ({
  name: `quota_${name}`,
  priority,
  render: (p, { data }) => {
    const q = data.getQuota(p, name)?.h5;
    return q ? block(level(q.usedPct), `${label} ${q.usedPct}%`) : '';
  },
});

export default {
  separator: ' ',
  segments: [
    {
      name: 'model',
      priority: 10,
      render: (p, { data }) => (data.getModel(p) ? block(C.blue, data.getModel(p)) : ''),
    },
    {
      name: 'cwd_branch',
      priority: 6,
      render: (p, { data }) => {
        const branch = data.getBranch(p);
        const cwd = data.getCwdName(p);
        return block(C.cyan, branch ? `${cwd} ${BRANCH} ${branch}` : cwd);
      },
    },
    {
      name: 'context',
      priority: 9,
      render: (p, { data }) => {
        const c = data.getContext(p);
        return c ? block(level(c.pct), `ctx ${Math.round(c.pct)}%`) : '';
      },
    },
    quota('gemini', 'G', 8),
    quota('3p', '3P', 7),
    {
      name: 'version',
      priority: 1,
      render: (p) => (p?.version ? block(C.gray, `v${p.version}`) : ''),
    },
  ],
};
