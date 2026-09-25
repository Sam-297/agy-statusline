import test from 'node:test';
import assert from 'node:assert';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { FIXTURES } from '../helpers.js';

const root = path.resolve(import.meta.dirname, '../..');
// Built next to run.js (like the real bundle) so import.meta.url-relative paths resolve the same.
const out = path.join(root, 'src', 'core', `run.bundle.test-${process.pid}.js`);

test('the published one-file bundle renders exactly like the sources', async (t) => {
  t.after(() => fs.rmSync(out, { force: true }));
  execFileSync(process.execPath, [path.join(root, 'scripts', 'build.mjs'), '--out', out]);

  const bundle = await import(url.pathToFileURL(out).href);
  const source = await import('../../src/core/run.js');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-bundle-'));
  for (const theme of ['default', 'dashboard', 'retro']) {
    const configPath = path.join(dir, `${theme}.mjs`);
    fs.writeFileSync(configPath, `export default { theme: '${theme}' };`);
    for (const name of FIXTURES) {
      const input = fs.readFileSync(
        path.join(root, 'tests/fixtures/payloads', `${name}.json`),
        'utf8'
      );
      const opts = { configPath, env: {}, platform: 'linux' };
      assert.strictEqual(
        await bundle.renderFromInput(input, opts),
        await source.renderFromInput(input, opts),
        `${theme} × ${name}`
      );
    }
  }
});
