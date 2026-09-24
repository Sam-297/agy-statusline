import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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

test('linux/mac: single-quoted node + script (sh -c runs it; spaces are fine)', () => {
  assert.deepStrictEqual(
    chooseCommand({
      env: { PATH: '' },
      platform: 'linux',
      scriptPath: '/a b/bin/agy-statusline',
      nodePath: '/usr/bin/node',
    }),
    { command: "'/usr/bin/node' '/a b/bin/agy-statusline'" }
  );
});

test('linux/mac: shell metacharacters in the path are never interpreted by sh', () => {
  const scriptPath = "/tmp/$(touch pwned)/it's `x`/bin/agy-statusline";
  const { command } = chooseCommand({
    env: { PATH: '' },
    platform: 'linux',
    scriptPath,
    nodePath: '/usr/bin/node',
  });
  assert.strictEqual(
    command,
    `'/usr/bin/node' '/tmp/$(touch pwned)/it'\\''s \`x\`/bin/agy-statusline'`
  );
  if (process.platform !== 'win32') {
    // Ask the real sh what it would pass as arguments.
    const argv = execFileSync('sh', ['-c', `printf '%s\\n' ${command.replace(/^'[^']*' /, '')}`], {
      encoding: 'utf8',
    });
    assert.strictEqual(argv, `${scriptPath}\n`);
  }
});

test('windows: shell metacharacters in the path → not registered as node <path>', () => {
  const res = chooseCommand({
    env: { Path: '' },
    platform: 'win32',
    scriptPath: 'C:\\evil&calc\\bin\\agy-statusline',
    nodePath: 'C:\\node.exe',
  });
  assert.ok(res.error, JSON.stringify(res));
});

function fakeNpmPrefix(dirName) {
  const { root } = sandbox();
  const npmDir = path.join(root, dirName);
  const pkgBin = path.join(npmDir, 'node_modules', '@sam-297', 'agy-statusline', 'bin');
  fs.mkdirSync(pkgBin, { recursive: true });
  fs.writeFileSync(path.join(pkgBin, 'agy-statusline'), '');
  fs.writeFileSync(path.join(npmDir, 'agy-statusline.cmd'), '');
  return { npmDir, scriptPath: path.join(pkgBin, 'agy-statusline') };
}

test('windows: path without spaces → node <path> directly (skips the ~20 ms npm .cmd shim)', () => {
  const { npmDir, scriptPath } = fakeNpmPrefix('npm');
  const res = chooseCommand({
    env: { Path: npmDir, PATHEXT: '.EXE;.CMD' },
    platform: 'win32',
    scriptPath,
    nodePath: 'C:\\node.exe',
  });
  assert.deepStrictEqual(res, { command: `node ${scriptPath}` });
});

test('windows: path with spaces → bare command through our npm shim on PATH', () => {
  const { npmDir, scriptPath } = fakeNpmPrefix('npm dir');
  const res = chooseCommand({
    env: { Path: npmDir, PATHEXT: '.EXE;.CMD' },
    platform: 'win32',
    scriptPath,
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
    command: "'/usr/bin/node' '/opt/agy-statusline/bin/agy-statusline'",
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

test('a foreign tool that happens to be named agy-statusline is not mistaken for ours', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  const foreign = { type: 'command', command: 'agy-statusline --their-flags', enabled: true };
  fs.writeFileSync(agySettingsPath(ctx.home), JSON.stringify({ statusLine: foreign }));

  assert.strictEqual(uninstall(ctx), 0); // not ours: untouched
  assert.deepStrictEqual(readSettings(ctx).statusLine, foreign);

  assert.strictEqual(install(ctx), 0); // ours now; the foreign one is remembered…
  assert.strictEqual(uninstall(ctx), 0); // …and restored
  assert.deepStrictEqual(readSettings(ctx).statusLine, foreign);
});

test('reinstall after the command changed (e.g. new node path) still restores the original', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  const original = { type: 'command', command: 'other-tool', enabled: true };
  fs.writeFileSync(agySettingsPath(ctx.home), JSON.stringify({ statusLine: original }));
  assert.strictEqual(install(ctx), 0);
  assert.strictEqual(install({ ...ctx, nodePath: '/opt/node-22/bin/node' }), 0);
  assert.strictEqual(uninstall(ctx), 0);
  assert.deepStrictEqual(readSettings(ctx).statusLine, original);
});

test('the v1 hook command counts as ours (upgrade path), so it is not "restored" later', () => {
  const { ctx: make } = sandbox();
  const ctx = make();
  fs.mkdirSync(path.dirname(agySettingsPath(ctx.home)), { recursive: true });
  const v1 = {
    type: 'command',
    command: '/home/u/.gemini/config/plugins/agy-statusline/hooks/status-line.sh',
    enabled: true,
  };
  fs.writeFileSync(agySettingsPath(ctx.home), JSON.stringify({ statusLine: v1 }));
  assert.strictEqual(install(ctx), 0);
  assert.strictEqual(uninstall(ctx), 0);
  assert.strictEqual(readSettings(ctx).statusLine, undefined);
});
