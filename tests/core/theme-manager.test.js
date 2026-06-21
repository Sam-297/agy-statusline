import test from 'node:test';
import assert from 'node:assert';
import { handleThemeCommand } from '../../src/core/theme-manager.js';

test('handleThemeCommand is defined', (t) => {
  assert.strictEqual(typeof handleThemeCommand, 'function');
});
