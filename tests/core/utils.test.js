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

test(
  'atomicWriteSync writes through a symlink and keeps the file mode',
  { skip: process.platform === 'win32' },
  () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-utils-'));
    const real = path.join(dir, 'dotfiles-settings.json');
    const link = path.join(dir, 'settings.json');
    fs.writeFileSync(real, '{}');
    fs.chmodSync(real, 0o600);
    fs.symlinkSync(real, link);
    atomicWriteSync(link, '{"a":1}');
    assert.ok(fs.lstatSync(link).isSymbolicLink(), 'link must stay a link');
    assert.strictEqual(fs.readFileSync(real, 'utf8'), '{"a":1}');
    assert.strictEqual(fs.statSync(real).mode & 0o777, 0o600);
  }
);
