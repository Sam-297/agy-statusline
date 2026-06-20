import { test } from 'node:test';
import assert from 'node:assert';
import { renderVersion } from '../../../src/features/session/version.js';
import colors from '../../../src/core/colors.js';

test('renderVersion returns orange version string', () => {
  const payload = { version: '1.0.10' };
  const expected = colors.orange('v1.0.10');
  assert.strictEqual(renderVersion(payload), expected);
});

test('renderVersion returns empty if missing', () => {
  assert.strictEqual(renderVersion({}), '');
});
