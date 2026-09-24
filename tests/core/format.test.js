import test from 'node:test';
import assert from 'node:assert';
import { formatNumber, pctColor, bar, formatTime, formatDayTime } from '../../src/core/format.js';
import { stripAnsi } from '../../src/core/width.js';
import colors from '../../src/core/colors.js';

test('formatNumber', () => {
  assert.strictEqual(formatNumber(999), '999');
  assert.strictEqual(formatNumber(21367), '21.4k');
  assert.strictEqual(formatNumber(250000), '250k');
  assert.strictEqual(formatNumber(1000000), '1M');
  assert.strictEqual(formatNumber(NaN), '0');
});

test('pctColor thresholds', () => {
  assert.strictEqual(pctColor(10), colors.green);
  assert.strictEqual(pctColor(50), colors.yellow);
  assert.strictEqual(pctColor(70), colors.orange);
  assert.strictEqual(pctColor(90), colors.red);
});

test('bar fills proportionally and clamps', () => {
  assert.strictEqual(stripAnsi(bar(50, 10)), '█████░░░░░');
  assert.strictEqual(stripAnsi(bar(0, 4)), '░░░░');
  assert.strictEqual(stripAnsi(bar(250, 4)), '████');
  assert.strictEqual(stripAnsi(bar(50, 4, { full: '#', empty: '-' })), '##--');
});

test('time formatting uses 24h local time', () => {
  const d = new Date(2026, 8, 28, 14, 5); // Mon 28 Sep 2026 14:05 local
  assert.strictEqual(formatTime(d), '14:05');
  assert.strictEqual(formatDayTime(d), 'Mon 14:05');
  assert.strictEqual(formatTime(new Date(2026, 0, 1, 0, 5)), '00:05');
});
