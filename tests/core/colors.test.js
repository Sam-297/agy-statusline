import test from 'node:test';
import assert from 'node:assert';
import colors from '../../src/core/colors.js';

test('ANSI color wrappers', (t) => {
  assert.strictEqual(colors.green('text'), '\x1b[38;2;0;160;0mtext\x1b[0m');
  assert.strictEqual(colors.dim('text'), '\x1b[2mtext\x1b[0m');
  assert.strictEqual(colors.orange('text'), '\x1b[38;2;255;176;85mtext\x1b[0m');
  assert.strictEqual(colors.blue('text'), '\x1b[38;2;0;153;255mtext\x1b[0m');
  assert.strictEqual(colors.red('text'), '\x1b[38;2;255;85;85mtext\x1b[0m');
  assert.strictEqual(colors.yellow('text'), '\x1b[38;2;230;200;0mtext\x1b[0m');
});

test('Color disabling via NO_COLOR', (t) => {
  process.env.NO_COLOR = '1';
  assert.strictEqual(colors.green('text'), 'text');
  delete process.env.NO_COLOR;
});
