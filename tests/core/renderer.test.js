import test from 'node:test';
import assert from 'node:assert';
import { renderStatusLine } from '../../src/core/renderer.js';

test('renderStatusLine correctly joins segments', () => {
  const payload = { model: { display_name: 'Claude' }, version: 'v1' };
  const config = { separator: ' | ', segments: ['model', 'version'] };
  const result = renderStatusLine(payload, config);
  assert.match(result, /Claude/);
  assert.match(result, /v1/);
  assert.ok(result.includes(' | '));
});
