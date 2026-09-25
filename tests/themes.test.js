import test from 'node:test';
import assert from 'node:assert';
import { renderStatusLine, maxWidthFor } from '../src/core/renderer.js';
import { resolveConfig, listThemes } from '../src/core/config.js';
import { stripAnsi, displayWidth } from '../src/core/width.js';
import { fixture, FIXTURES } from './helpers.js';

const FAKE =
  /SYS_CORE|\bMAIN\b|NET:OK|Unknown|v1\.0\.0|\[free\]|Arts:|undefined|NaN|\[object|timeout\]/;
const PII = /user@example\.com|00000000-0000-4000-8000/;

for (const theme of listThemes()) {
  for (const name of FIXTURES) {
    for (const width of [40, 80, 120, 200]) {
      test(`${theme} × ${name} @${width}`, async () => {
        const payload = { ...fixture(name), terminal_width: width };
        const config = await resolveConfig({ theme });
        assert.deepStrictEqual(config.warnings, []);
        const out = await renderStatusLine(payload, config);
        const plain = stripAnsi(out);
        assert.ok(displayWidth(out) <= maxWidthFor(payload), `overflow:\n${plain}`);
        assert.ok(!FAKE.test(plain), `fake/placeholder data:\n${plain}`);
        assert.ok(!PII.test(plain), `PII leaked:\n${plain}`);
        if (payload.model) assert.ok(plain.trim().length > 0, 'blank output');
      });
    }
  }
}

test('dashboard keeps rendering at 80 columns (regression: audit #11)', async () => {
  const out = stripAnsi(
    await renderStatusLine(
      { ...fixture('linux-git-active'), terminal_width: 80 },
      await resolveConfig({ theme: 'dashboard' })
    )
  );
  assert.ok(out.split('\n').length >= 3, out);
  assert.match(out, /Claude Opus 4\.6/);
});

const withQuota = {
  ...fixture('linux-git-active'),
  terminal_width: 200,
  quota: {
    'gemini-5h': { remaining_fraction: 0.62, reset_time: '2026-09-24T15:18:21Z' },
    'gemini-weekly': { remaining_fraction: 0.91, reset_time: '2026-10-01T10:18:21Z' },
    '3p-5h': { remaining_fraction: 0.24, reset_time: '2026-09-24T15:18:21Z' },
    '3p-weekly': { remaining_fraction: 0.47, reset_time: '2026-10-01T10:18:21Z' },
  },
};

test('quota theme shows a bar and reset time for every quota window', async () => {
  const out = stripAnsi(await renderStatusLine(withQuota, await resolveConfig({ theme: 'quota' })));
  for (const pct of ['38%', '9%', '76%', '53%']) assert.ok(out.includes(pct), `${pct} in ${out}`);
  assert.strictEqual(out.match(/[█░]{8}/g)?.length, 5, `context + 4 quota bars in ${out}`);
  assert.strictEqual(out.match(/↻/g)?.length, 4, out);
});

test('powerline theme draws colored blocks joined by arrow glyphs', async () => {
  const out = await renderStatusLine(withQuota, await resolveConfig({ theme: 'powerline' }));
  const arrow = String.fromCodePoint(0xe0b0);
  assert.ok(out.split(arrow).length - 1 >= 4, stripAnsi(out));
  assert.match(out, /\x1b\[48;2;/, 'uses background colors');
  assert.match(stripAnsi(out), /Claude Opus 4\.6/);
});

test('quota theme keeps the quota bars on a 90-column terminal by dropping reset times', async () => {
  const out = stripAnsi(
    await renderStatusLine(
      { ...withQuota, terminal_width: 90 },
      await resolveConfig({ theme: 'quota' })
    )
  );
  assert.match(out, /G 5h [█░]{8} 38% · 7d [█░]{8} 9%/, out);
  assert.ok(!out.includes('↻'), out);
});
