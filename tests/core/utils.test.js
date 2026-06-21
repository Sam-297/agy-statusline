import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { getConfigDir, atomicWriteSync } from '../../src/core/utils.js';

test('getConfigDir returns string', (t) => {
  const dir = getConfigDir();
  assert.strictEqual(typeof dir, 'string');
});
