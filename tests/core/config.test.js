import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  loadConfig,
  resolveConfig,
  listThemes,
  defaultConfigSource,
} from '../../src/core/config.js';

function writeConfig(source) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-config-'));
  const file = path.join(dir, 'config.mjs');
  fs.writeFileSync(file, source);
  return file;
}

test('listThemes lists the built-ins', () => {
  assert.deepStrictEqual(listThemes(), [
    'cyberpunk',
    'dashboard',
    'default',
    'elegant',
    'powerline',
    'progress-bar',
    'quota',
    'retro',
  ]);
});

test('missing config file → default theme, no warnings', async () => {
  const c = await loadConfig('/does/not/exist/config.mjs');
  assert.strictEqual(c.theme, 'default');
  assert.ok(c.segments.includes('model'));
  assert.deepStrictEqual(c.warnings, []);
});

test('theme by name, with user overrides on top', async () => {
  const c = await loadConfig(writeConfig("export default { theme: 'elegant', separator: ' / ' };"));
  assert.strictEqual(c.theme, 'elegant');
  assert.strictEqual(c.separator, ' / ');
  assert.ok(c.segments.length > 0);
});

test('legacy copied-theme config still works', async () => {
  const c = await loadConfig(
    writeConfig("export default { separator: ' - ', segments: ['model', 'version'] };")
  );
  assert.deepStrictEqual(c.segments, ['model', 'version']);
  assert.deepStrictEqual(c.warnings, []);
});

test('array export is treated as segments', async () => {
  const c = await loadConfig(writeConfig("export default ['model'];"));
  assert.deepStrictEqual(c.segments, ['model']);
});

test('mistakes become visible warnings instead of silent fallbacks', async () => {
  const c = await resolveConfig({ theme: 'nope', segments: ['model', 'modle', 42] });
  assert.strictEqual(c.theme, 'default');
  assert.deepStrictEqual(c.warnings, [
    'unknown theme "nope"',
    'unknown segment "modle"',
    'invalid segment (number)',
  ]);
  assert.deepStrictEqual(c.segments, ['model', 'modle']);
  const bad = await resolveConfig({ segments: 'model' });
  assert.deepStrictEqual(bad.warnings, ['segments must be an array']);
  assert.ok(Array.isArray(bad.segments));
});

test('syntax error in config → default theme + warning', async () => {
  const c = await loadConfig(writeConfig('export default { segments: [ '));
  assert.strictEqual(c.theme, 'default');
  assert.match(c.warnings[0], /^config error: /);
});

test('defaultConfigSource is a loadable config', async () => {
  const c = await loadConfig(writeConfig(defaultConfigSource('dashboard')));
  assert.strictEqual(c.theme, 'dashboard');
  assert.deepStrictEqual(c.warnings, []);
});
