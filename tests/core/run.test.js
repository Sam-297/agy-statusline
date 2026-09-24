import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { PassThrough } from 'node:stream';
import { readStdin, renderFromInput } from '../../src/core/run.js';
import { stripAnsi } from '../../src/core/width.js';

test('readStdin resolves on end', async () => {
  const s = new PassThrough();
  const p = readStdin(s, 1000);
  s.end('{"a":1}');
  assert.strictEqual(await p, '{"a":1}');
});

test('readStdin gives up after the timeout if stdin never closes', async () => {
  const s = new PassThrough();
  s.write('{"a"');
  const start = Date.now();
  assert.strictEqual(await readStdin(s, 50), '{"a"');
  assert.ok(Date.now() - start < 500);
});

test('renderFromInput: bad JSON → empty line, never throws', async () => {
  assert.strictEqual(await renderFromInput('not json', { configPath: '/nope/config.mjs' }), '');
});

test('renderFromInput uses CRLF on windows', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-run-'));
  const configPath = path.join(dir, 'config.mjs');
  fs.writeFileSync(
    configPath,
    "export default { separator: '\\n', segments: [() => 'a', () => 'b'] };"
  );
  assert.strictEqual(
    stripAnsi(await renderFromInput('{}', { configPath, platform: 'win32' })),
    'a\r\nb'
  );
});
