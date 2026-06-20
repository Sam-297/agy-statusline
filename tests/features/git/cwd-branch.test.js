import { test } from 'node:test';
import assert from 'node:assert';
import { renderCwdBranch } from '../../../src/features/git/cwd-branch.js';
import colors from '../../../src/core/colors.js';
import path from 'node:path';

test('renderCwdBranch formats cwd and branch correctly', () => {
  const payload = { cwd: '/home/test/agy-statusline' };
  const utils = { getBranch: () => 'main', homeDir: '/home/test' };
  const res = renderCwdBranch(payload, utils);
  assert.strictEqual(res, '\x1B[38;2;46;149;153magy-statusline\x1B[0m\x1B[2m@\x1B[0m\x1B[38;2;0;160;0mmain\x1B[0m');
});

test('renderCwdBranch shows ~ for home dir', () => {
  const payload = { cwd: '/home/test' };
  const utils = { getBranch: () => null, homeDir: '/home/test' };
  const res = renderCwdBranch(payload, utils);
  assert.strictEqual(res, '\x1B[38;2;46;149;153m~\x1B[0m');
});
