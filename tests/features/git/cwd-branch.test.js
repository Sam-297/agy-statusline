import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import { renderCwdBranch } from '../../../src/features/git/cwd-branch.js';
import colors from '../../../src/core/colors.js';
import path from 'node:path';

test('renderCwdBranch formats cwd and branch correctly', () => {
  const payload = { cwd: '/home/test/agy-statusline' };
  const utils = { getBranch: () => 'main', homeDir: '/home/test' };
  const res = renderCwdBranch(payload, utils);
  assert.strictEqual(res, '\x1b[38;2;46;149;153magy-statusline\x1b[0m\x1b[2m@\x1b[0m\x1b[38;2;0;160;0mmain\x1b[0m');
});

test('renderCwdBranch shows ~ for home dir', () => {
  const payload = { cwd: '/home/test' };
  const utils = { getBranch: () => null, homeDir: '/home/test' };
  const res = renderCwdBranch(payload, utils);
  assert.strictEqual(res, '\x1b[38;2;46;149;153m~\x1b[0m');
});

test('getBranchNative uses native fs.readFileSync and not execSync', () => {
  const code = fs.readFileSync(new URL('../../../src/features/git/cwd-branch.js', import.meta.url), 'utf8');
  assert.ok(code.includes('fs.readSync('), 'Should use fs.readSync for safety');
  assert.ok(!code.includes('execSync'), 'Should not use child_process');
  assert.ok(!code.includes('child_process'), 'Should not use child_process');
});
