import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { loadConfig } from '../../src/core/config.js';

test('loadConfig provides defaults when file is missing', async (t) => {
  const config = await loadConfig('/path/does/not/exist.js');
  assert.strictEqual(config.separator, '\x1B[2m | \x1B[0m');
  assert.deepStrictEqual(config.segments, ['model', 'cwd_branch', 'tokens', 'quota_gemini', 'quota_anthropic', 'version']);
});

test('loadConfig loads and merges user config', async (t) => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-test-'));
  const configPath = path.join(tmpDir, 'config.js');
  fs.writeFileSync(configPath, 'export default { separator: " - " };');
  
  try {
    const config = await loadConfig(configPath);
    assert.strictEqual(config.separator, ' - ');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
