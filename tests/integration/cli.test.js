import test from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('CLI renders payload correctly', () => {
  const binPath = path.resolve(import.meta.dirname, '../../bin/agy-statusline');
  const payload = JSON.stringify({ version: '1.2.3', model: { display_name: 'GPT' } });
  
  const stdout = execSync(`node ${binPath}`, { input: payload, encoding: 'utf8' });
  assert.ok(stdout.includes('GPT'));
});

test('CLI --help prints usage and exits 0', () => {
  const binPath = path.resolve(import.meta.dirname, '../../bin/agy-statusline');
  const stdout = execSync(`node ${binPath} --help`, { encoding: 'utf8' });
  assert.match(stdout, /Usage: agy-statusline/);
});

test('CLI --setup writes config and exits 0', () => {
  const binPath = path.resolve(import.meta.dirname, '../../bin/agy-statusline');
  const stdout = execSync(`node ${binPath} --setup`, { encoding: 'utf8' });
  assert.ok(stdout.includes('statusLine'));
});
