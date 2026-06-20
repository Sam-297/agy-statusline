import { test } from 'node:test';
import assert from 'node:assert';
import { renderModel } from '../../../src/features/session/model.js';
import colors from '../../../src/core/colors.js';

test('renderModel returns blue model name', () => {
  const payload = { model: { display_name: 'Claude Opus 4.6 (Thinking)' } };
  const expected = colors.blue('Claude Opus 4.6 (Thinking)');
  assert.strictEqual(renderModel(payload), expected);
});

test('renderModel handles missing model gracefully', () => {
  const payload = {};
  assert.strictEqual(renderModel(payload), '');
});
