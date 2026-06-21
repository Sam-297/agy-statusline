import test from 'node:test';
import assert from 'node:assert';
import { parsePayload } from '../../src/core/parser.js';

test('parsePayload correctly parses valid JSON', (t) => {
  const json = JSON.stringify({ version: '1.0.0' });
  const result = parsePayload(json);
  assert.deepStrictEqual(result, { version: '1.0.0' });
});

test('parsePayload safely handles invalid JSON', (t) => {
  const result = parsePayload('invalid json');
  assert.strictEqual(result, null);
});

test('parsePayload enforces 64MB size limit', (t) => {
  const hugeJson = '{"a":"' + 'A'.repeat(64 * 1024 * 1024 + 100) + '"}';
  const result = parsePayload(hugeJson);
  assert.strictEqual(result, null);
});
