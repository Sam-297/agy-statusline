import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setTheme, printThemes, preview } from '../../src/cli/theme.js';
import { loadConfig } from '../../src/core/config.js';
import { stripAnsi } from '../../src/core/width.js';

function io() {
  const lines = [];
  const configDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-theme-'));
  return {
    lines,
    configDir,
    out: (s) => lines.push(s),
    err: (s) => lines.push(`ERR ${s}`),
    columns: 120,
  };
}

test('setTheme creates a config pointing at the theme', async () => {
  const ctx = io();
  assert.strictEqual(await setTheme('dashboard', ctx), 0);
  assert.strictEqual((await loadConfig(path.join(ctx.configDir, 'config.mjs'))).theme, 'dashboard');
});

test('setTheme edits only the theme line of an existing config', async () => {
  const ctx = io();
  const file = path.join(ctx.configDir, 'config.mjs');
  fs.writeFileSync(file, "export default {\n  theme: 'default',\n  separator: ' / ',\n};\n");
  assert.strictEqual(await setTheme('elegant', ctx), 0);
  assert.strictEqual(
    fs.readFileSync(file, 'utf8'),
    "export default {\n  theme: 'elegant',\n  separator: ' / ',\n};\n"
  );
});

test('setTheme on a legacy config backs it up first', async () => {
  const ctx = io();
  const file = path.join(ctx.configDir, 'config.mjs');
  fs.writeFileSync(file, "export default { segments: ['model'] };\n");
  assert.strictEqual(await setTheme('retro', ctx), 0);
  assert.strictEqual(
    fs.readFileSync(file + '.bak', 'utf8'),
    "export default { segments: ['model'] };\n"
  );
  assert.match(fs.readFileSync(file, 'utf8'), /theme: 'retro'/);
});

test('setTheme rejects unknown names and lists the valid ones', async () => {
  const ctx = io();
  assert.strictEqual(await setTheme('nope', ctx), 1);
  assert.match(ctx.lines.join('\n'), /Unknown theme "nope"\. Available: cyberpunk, dashboard/);
});

test('printThemes lists all themes', () => {
  const ctx = io();
  assert.strictEqual(printThemes(ctx), 0);
  assert.deepStrictEqual(ctx.lines, [
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

test('preview renders every theme with the sample payload', async () => {
  const ctx = io();
  assert.strictEqual(await preview(undefined, ctx), 0);
  const text = stripAnsi(ctx.lines.join('\n'));
  for (const t of ['default', 'dashboard', 'retro']) assert.ok(text.includes(t));
  assert.match(text, /Gemini 3\.1 Pro/);
  assert.ok(!text.includes('user@example.com'));
});

test('setTheme never overwrites an earlier backup', async () => {
  const ctx = io();
  const file = path.join(ctx.configDir, 'config.mjs');
  fs.writeFileSync(file, 'export default { segments: [1] };\n');
  await setTheme('retro', ctx);
  fs.writeFileSync(file, 'export default { segments: [2] };\n');
  await setTheme('retro', ctx);
  const backups = fs.readdirSync(ctx.configDir).filter((f) => f.includes('.bak'));
  assert.strictEqual(backups.length, 2, backups.join(', '));
  const contents = backups.map((f) => fs.readFileSync(path.join(ctx.configDir, f), 'utf8')).sort();
  assert.deepStrictEqual(contents, [
    'export default { segments: [1] };\n',
    'export default { segments: [2] };\n',
  ]);
});

test('setTheme ignores a theme: inside a comment', async () => {
  const ctx = io();
  const file = path.join(ctx.configDir, 'config.mjs');
  fs.writeFileSync(file, "// was: theme: 'retro'\nexport default {\n  theme: 'default',\n};\n");
  assert.strictEqual(await setTheme('dashboard', ctx), 0);
  assert.strictEqual((await loadConfig(file)).theme, 'dashboard');
  assert.match(fs.readFileSync(file, 'utf8'), /\/\/ was: theme: 'retro'/);
});

test('setTheme never rewrites user code that merely contains theme:', async () => {
  const ctx = io();
  const file = path.join(ctx.configDir, 'config.mjs');
  const source =
    "const theme = 'quota';\nexport default { theme, segments: [{ render: () => ({ theme: 'x' }).theme }] };\n";
  fs.writeFileSync(file, source);
  assert.strictEqual(await setTheme('retro', ctx), 0);
  assert.strictEqual((await loadConfig(file)).theme, 'retro');
  assert.strictEqual(fs.readFileSync(file + '.bak', 'utf8'), source, 'original kept as backup');
});
