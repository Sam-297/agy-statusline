import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

test('Documentation files exist', () => {
  const root = process.cwd();
  assert.ok(fs.existsSync(path.join(root, 'README.md')), 'README.md exists');
  assert.ok(fs.existsSync(path.join(root, 'INSTALL.md')), 'INSTALL.md exists');
  assert.ok(fs.existsSync(path.join(root, 'CHANGELOG.md')), 'CHANGELOG.md exists');
  assert.ok(fs.existsSync(path.join(root, 'LICENSE')), 'LICENSE exists');
  assert.ok(fs.existsSync(path.join(root, '.gitignore')), '.gitignore exists');
});
