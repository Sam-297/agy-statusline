import test from 'node:test';
import assert from 'node:assert';
import { execSync } from 'node:child_process';
import path from 'node:path';

test('CLI renders payload correctly', () => {
  const binPath = path.resolve(import.meta.dirname, '../../bin/agy-statusline.js');
  const payload = JSON.stringify({ version: '1.2.3', model: { display_name: 'GPT' } });
  
  const stdout = execSync(`node ${binPath}`, { input: payload, encoding: 'utf8' });
  assert.ok(stdout.includes('1.2.3'));
  assert.ok(stdout.includes('GPT'));
});
