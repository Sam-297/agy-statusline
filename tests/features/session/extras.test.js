import { test } from 'node:test';
import assert from 'node:assert';
import { renderExtras } from '../../../src/features/session/extras.js';
import colors from '../../../src/core/colors.js';

test('renderExtras formats tool confirmation and flags', () => {
  const payload = {
    tool_confirmation_pending: true,
    sandbox: { enabled: true },
    exceeds_200k_tokens: true
  };
  const expected = `${colors.orange('⚡CONFIRM')} 🔒 ${colors.red('⚠>200k')}`;
  assert.strictEqual(renderExtras(payload), expected);
});

test('renderExtras returns empty when no flags', () => {
  assert.strictEqual(renderExtras({}), '');
});
