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
