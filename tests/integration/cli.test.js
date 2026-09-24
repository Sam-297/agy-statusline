import test from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const binPath = path.resolve(import.meta.dirname, '../../bin/agy-statusline');

// Every CLI run gets its own XDG_CONFIG_HOME so tests never read or write the real user config.
function makeEnv() {
  const xdg = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-statusline-test-'));
  return { xdg, env: { ...process.env, XDG_CONFIG_HOME: xdg } };
}

test('CLI renders payload correctly', () => {
  const { env } = makeEnv();
  const payload = JSON.stringify({ version: '1.2.3', model: { display_name: 'GPT' } });

  const stdout = execSync(`node ${binPath}`, { input: payload, encoding: 'utf8', env });
  assert.ok(stdout.includes('GPT'));
});

test('CLI reads config from XDG_CONFIG_HOME', () => {
  const { xdg, env } = makeEnv();
  fs.mkdirSync(path.join(xdg, 'agy-statusline'));
  fs.writeFileSync(
    path.join(xdg, 'agy-statusline', 'config.mjs'),
    "export default { segments: [() => 'FROM_XDG'] };\n"
  );

  const stdout = execSync(`node ${binPath}`, { input: '{}', encoding: 'utf8', env });
  assert.ok(stdout.includes('FROM_XDG'), `expected XDG config to be used, got: ${stdout}`);
});

test('CLI --help prints usage and exits 0', () => {
  const { env } = makeEnv();
  const stdout = execSync(`node ${binPath} --help`, { encoding: 'utf8', env });
  assert.match(stdout, /Usage: agy-statusline/);
});

test('CLI --setup writes config and exits 0', () => {
  const { xdg, env } = makeEnv();
  const stdout = execSync(`node ${binPath} --setup`, { encoding: 'utf8', env });
  assert.ok(stdout.includes('statusLine'));
  assert.ok(fs.existsSync(path.join(xdg, 'agy-statusline', 'config.mjs')));
});
