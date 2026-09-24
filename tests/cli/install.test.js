import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  chooseCommand,
  install,
  uninstall,
  agySettingsPath,
  findOnPath,
} from '../../src/cli/install.js';

function sandbox() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-install-'));
  const logs = [];
  return {
    root,
    logs,
    ctx: (overrides = {}) => ({
      home: path.join(root, 'home'),
      env: { PATH: '' },
      platform: 'linux',
      configDir: path.join(root, 'config'),
      scriptPath: '/opt/agy-statusline/bin/agy-statusline',
      nodePath: '/usr/bin/node',
      out: (s) => logs.push(s),
      err: (s) => logs.push(`ERR ${s}`),
      ...overrides,
    }),
  };
}

const readSettings = (ctx) => JSON.parse(fs.readFileSync(agySettingsPath(ctx.home), 'utf8'));

test('linux/mac: absolute quoted node + script (sh -c handles quotes)', () => {
  assert.deepStrictEqual(
    chooseCommand({
      env: { PATH: '' },
      platform: 'linux',
      scriptPath: '/a b/bin/agy-statusline',
      nodePath: '/usr/bin/node',
    }),
    { command: '"/usr/bin/node" "/a b/bin/agy-statusline"' }
  );
});

test('windows: bare command when our npm shim is on PATH', () => {
  const { root } = sandbox();
  const npmDir = path.join(root, 'npm');
  const pkgBin = path.join(npmDir, 'node_modules', '@sam-297', 'agy-statusline', 'bin');
  fs.mkdirSync(pkgBin, { recursive: true });
  fs.writeFileSync(path.join(pkgBin, 'agy-statusline'), '');
  fs.writeFileSync(path.join(npmDir, 'agy-statusline.cmd'), '');
  const res = chooseCommand({
    env: { Path: npmDir, PATHEXT: '.EXE;.CMD' },
    platform: 'win32',
    scriptPath: path.join(pkgBin, 'agy-statusline'),
    nodePath: 'C:\\node.exe',
  });
  assert.deepStrictEqual(res, { command: 'agy-statusline' });
});

test("windows: someone else's agy-statusline on PATH is not used", () => {
  const { root } = sandbox();
  const other = path.join(root, 'other');
  fs.mkdirSync(other);
  fs.writeFileSync(path.join(other, 'agy-statusline.cmd'), '');
  const res = chooseCommand({
    env: { Path: other, PATHEXT: '.CMD' },
    platform: 'win32',
    scriptPath: 'C:\\src\\agy\\bin\\agy-statusline',
    nodePath: 'C:\\node.exe',
  });
  assert.deepStrictEqual(res, { command: 'node C:\\src\\agy\\bin\\agy-statusline' });
});

test('windows: path with spaces and no shim → explains npm install', () => {
  const res = chooseCommand({
    env: { Path: '' },
    platform: 'win32',
    scriptPath: 'C:\\Users\\Jane Doe\\agy\\bin\\agy-statusline',
    nodePath: 'C:\\node.exe',
  });
  assert.match(res.error, /npm i -g @sam-297\/agy-statusline/);
});

test('findOnPath honours PATHEXT on windows and plain names elsewhere', () => {
  const { root } = sandbox();
  fs.writeFileSync(path.join(root, 'tool.cmd'), '');
  fs.writeFileSync(path.join(root, 'tool'), '');
  assert.strictEqual(
    findOnPath('tool', { PATH: root, PATHEXT: '.CMD' }, 'win32'),
    path.join(root, 'tool.cmd')
  );
  assert.strictEqual(findOnPath('tool', { PATH: root }, 'linux'), path.join(root, 'tool'));
  assert.strictEqual(findOnPath('nope', { PATH: root }, 'linux'), null);
});

test('install writes statusLine, keeps other settings, saves the previous statusLine, creates config', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  const previous = { type: 'command', command: 'other-tool', enabled: true };
  fs.writeFileSync(agySettingsPath(ctx.home), JSON.stringify({ model: 'x', statusLine: previous }));

  assert.strictEqual(install(ctx), 0);
  const s = readSettings(ctx);
  assert.strictEqual(s.model, 'x');
  assert.deepStrictEqual(s.statusLine, {
    type: 'command',
    command: '"/usr/bin/node" "/opt/agy-statusline/bin/agy-statusline"',
    enabled: true,
  });
  assert.ok(fs.existsSync(path.join(ctx.configDir, 'config.mjs')));

  assert.strictEqual(install(ctx), 0); // idempotent: must not overwrite the saved previous with ourselves
  assert.strictEqual(uninstall(ctx), 0);
  assert.deepStrictEqual(readSettings(ctx).statusLine, previous);
  assert.strictEqual(readSettings(ctx).model, 'x');
});

test('install with no settings file creates one; uninstall then removes statusLine', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  assert.strictEqual(install(ctx), 0);
  assert.strictEqual(readSettings(ctx).statusLine.type, 'command');
  assert.strictEqual(uninstall(ctx), 0);
  assert.strictEqual(readSettings(ctx).statusLine, undefined);
});

test('install refuses to clobber an unparseable settings.json', () => {
  const { ctx: make, logs } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  fs.writeFileSync(agySettingsPath(ctx.home), '{ broken');
  assert.strictEqual(install(ctx), 1);
  assert.strictEqual(fs.readFileSync(agySettingsPath(ctx.home), 'utf8'), '{ broken');
  assert.match(logs.join('\n'), /Could not parse/);
});

test('uninstall leaves a foreign statusLine alone', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  const foreign = { type: 'command', command: 'other-tool', enabled: true };
  fs.writeFileSync(agySettingsPath(ctx.home), JSON.stringify({ statusLine: foreign }));
  assert.strictEqual(uninstall(ctx), 0);
  assert.deepStrictEqual(readSettings(ctx).statusLine, foreign);
});
