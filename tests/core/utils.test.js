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

test('atomicWriteSync replaces the file and leaves no temp files behind', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-utils-'));
  const file = path.join(dir, 'config.mjs');
  fs.writeFileSync(file, 'old');
  atomicWriteSync(file, 'new');
  assert.strictEqual(fs.readFileSync(file, 'utf8'), 'new');
  assert.deepStrictEqual(fs.readdirSync(dir), ['config.mjs']);
});
