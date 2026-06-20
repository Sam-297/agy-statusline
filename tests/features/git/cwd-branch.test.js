import { test } from 'node:test';
import assert from 'node:assert';
import { renderCwdBranch } from '../../../src/features/git/cwd-branch.js';
import colors from '../../../src/core/colors.js';
import path from 'node:path';

test('renderCwdBranch formats cwd and branch correctly', () => {
  const payload = { cwd: '/home/sam/Projects/agy-statusline' };
  const result = renderCwdBranch(payload, {
    getBranch: () => 'main',
    homeDir: '/home/sam'
  });
  const expected = `agy-statusline${colors.dim('@')}${colors.green('main')}`;
  assert.strictEqual(result, expected);
});

test('renderCwdBranch shows ~ for home dir', () => {
  const payload = { cwd: '/home/sam' };
  const result = renderCwdBranch(payload, { getBranch: () => null, homeDir: '/home/sam' });
  assert.strictEqual(result, '~');
});
