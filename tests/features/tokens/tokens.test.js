import { test } from 'node:test';
import assert from 'node:assert';
import { renderTokens } from '../../../src/features/tokens/tokens.js';
import colors from '../../../src/core/colors.js';

test('renderTokens formats tokens green when >= 50% remaining', () => {
  const payload = {
    context_window: {
      total_input_tokens: 1000,
      context_window_size: 10000,
      total_output_tokens: 500
    }
  };
  const expected = colors.green('1500/10000 (15%)');
  assert.strictEqual(renderTokens(payload), expected);
});

test('renderTokens formats tokens yellow when < 50% remaining', () => {
  const payload = {
    context_window: { total_input_tokens: 6000, context_window_size: 10000, total_output_tokens: 0 }
  };
  const expected = colors.yellow('6000/10000 (60%)');
  assert.strictEqual(renderTokens(payload), expected);
});

test('renderTokens formats tokens red when < 20% remaining', () => {
  const payload = {
    context_window: { total_input_tokens: 8500, context_window_size: 10000, total_output_tokens: 0 }
  };
  const expected = colors.red('8500/10000 (85%)');
  assert.strictEqual(renderTokens(payload), expected);
});
