import test from 'node:test';
import assert from 'node:assert';
import { renderStatusLine } from '../../src/core/renderer.js';

test('renderStatusLine correctly joins segments', async () => {
  const payload = { model: { display_name: 'Claude' }, version: 'v1' };
  const config = { separator: ' | ', segments: ['model', 'version'] };
  const result = await renderStatusLine(payload, config);
  assert.match(result, /Claude/);
  assert.match(result, /v1/);
  assert.ok(result.includes(' | '));
});

test('renderStatusLine supports custom functions', async () => {
  const payload = { tokens: { tokens_used: 10, tokens_total: 100 } };
  const config = {
    separator: ' | ',
    segments: [
      (payload) => `Custom: ${payload.tokens.tokens_used}`
    ]
  };
  const result = await renderStatusLine(payload, config);
  const expected = `Custom: 10\x1b[0m`;
  assert.strictEqual(result, expected);
});
