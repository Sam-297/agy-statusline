import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { stripAnsi } from '../../src/core/width.js';

const bin = path.resolve(import.meta.dirname, '../../bin/agy-statusline');
// Wide terminal so low-priority segments and warnings are never dropped in these tests.
const fixtureText = JSON.stringify({
  ...JSON.parse(
    fs.readFileSync(
      path.resolve(import.meta.dirname, '../fixtures/payloads/linux-git-active.json'),
      'utf8'
    )
  ),
  terminal_width: 200,
});

// Every run gets its own XDG_CONFIG_HOME and HOME, so tests never touch the real user config.
function run(args, { input, config } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-cli-'));
  const xdg = path.join(root, 'xdg');
  if (config) {
    fs.mkdirSync(path.join(xdg, 'agy-statusline'), { recursive: true });
    fs.writeFileSync(path.join(xdg, 'agy-statusline', 'config.mjs'), config);
  }
  const home = path.join(root, 'home');
  const env = { ...process.env, XDG_CONFIG_HOME: xdg, HOME: home, USERPROFILE: home, NO_COLOR: '' };
  const start = Date.now();
  const res = spawnSync(process.execPath, [bin, ...args], {
    input: input ?? '',
    encoding: 'utf8',
    env,
    timeout: 10000,
  });
  return { ...res, stdout: stripAnsi(res.stdout), ms: Date.now() - start, root };
}

test('render mode: real payload in, status line out, exit 0', () => {
  const r = run([], { input: fixtureText });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /Claude Opus 4\.6 \(Thinking\)/);
});

test('render mode: hanging custom segment → the rest still renders, fast, exit 0', () => {
  const r = run([], {
    input: fixtureText,
    config:
      "export default { segments: ['model', function hang() { return new Promise(() => {}); }] };",
  });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /Claude Opus 4\.6.*\[hang: timeout\]/);
  assert.ok(r.ms < 2000, `took ${r.ms}ms`);
});

test('render mode: garbage input → exit 0', () => {
  assert.strictEqual(run([], { input: 'garbage' }).status, 0);
});

test('render mode: config syntax error is visible in the line', () => {
  const r = run([], { input: fixtureText, config: 'export default {' });
  assert.strictEqual(r.status, 0);
  assert.match(r.stdout, /⚠ config error/);
});

test('--version and --help', () => {
  assert.match(run(['--version']).stdout, /^\d+\.\d+\.\d+/);
  assert.match(run(['--help']).stdout, /agy-statusline install/);
});

test('legacy flags still work: --list-themes, --load-theme', () => {
  assert.match(run(['--list-themes']).stdout, /dashboard/);
  assert.strictEqual(run(['--load-theme', 'retro']).status, 0);
});

test('unknown command → exit 1 with help', () => {
  const r = run(['frobnicate']);
  assert.strictEqual(r.status, 1);
  assert.match(r.stderr, /Unknown command: frobnicate/);
});

test('install via the CLI writes into $HOME/.gemini', () => {
  const r = run(['install']);
  assert.strictEqual(r.status, 0, r.stderr);
  const settings = JSON.parse(
    fs.readFileSync(
      path.join(r.root, 'home', '.gemini', 'antigravity-cli', 'settings.json'),
      'utf8'
    )
  );
  assert.strictEqual(settings.statusLine.type, 'command');
});
