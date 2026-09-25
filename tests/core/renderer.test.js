import test from 'node:test';
import assert from 'node:assert';
import { renderStatusLine, maxWidthFor } from '../../src/core/renderer.js';
import { stripAnsi, displayWidth } from '../../src/core/width.js';
import { fixture } from '../helpers.js';

const render = async (payload, config, opts) =>
  stripAnsi(await renderStatusLine(payload, config, opts));
const active = fixture('linux-git-active');

test('joins built-ins, functions, and object segments with the separator', async () => {
  const out = await render(
    { model: { display_name: 'M' }, version: '1' },
    { separator: ' | ', segments: ['model', () => 'fn', { render: () => 'obj' }, 'version'] }
  );
  assert.strictEqual(out, 'M | fn | obj | v1');
});

test('empty segments are skipped, no double separators', async () => {
  const out = await render(
    { model: { display_name: 'M' } },
    { separator: ' | ', segments: ['model', () => '', 'version'] }
  );
  assert.strictEqual(out, 'M');
});

test('a hanging segment times out without blanking the line', async () => {
  const start = Date.now();
  const out = await render(
    { model: { display_name: 'M' } },
    {
      separator: ' | ',
      segments: [
        'model',
        function slow() {
          return new Promise(() => {});
        },
      ],
    },
    { timeoutMs: 50 }
  );
  assert.strictEqual(out, 'M | [slow: timeout]');
  assert.ok(Date.now() - start < 500);
});

test('a throwing segment shows an inline error', async () => {
  const out = await render(
    {},
    {
      separator: ' ',
      segments: [
        function bad() {
          throw new Error('boom');
        },
      ],
    }
  );
  assert.strictEqual(out, '[bad: boom]');
});

test('drops lowest-priority segments first to fit, and never exceeds the width', async () => {
  const payload = { ...active, terminal_width: 60 };
  const out = await render(payload, {
    separator: ' | ',
    segments: ['model', 'cwd_branch', 'context', 'quota_gemini', 'quota_3p', 'version'],
  });
  assert.ok(out.startsWith('Claude Opus 4.6 (Thinking)'), out);
  assert.ok(!out.includes('v1.'), 'version (priority 1) dropped first');
  assert.ok(displayWidth(out) <= maxWidthFor(payload));
});

test('a single too-wide segment is truncated, not dropped', async () => {
  const out = await render(
    { terminal_width: 12 },
    { separator: ' ', segments: [() => 'abcdefghijklmnopqrstuvwxyz'] }
  );
  assert.strictEqual(out, 'abcdefghi…');
});

test('newline separators produce lines that are truncated individually', async () => {
  const out = await render(
    { terminal_width: 10 },
    { separator: '\n', segments: [() => 'short', () => 'a much longer line'] }
  );
  assert.strictEqual(out, 'short\na much …'); // max width 10 - 2 = 8 columns
});

test('warnings render as a trailing ⚠ segment', async () => {
  const out = await render(
    { model: { display_name: 'M' } },
    { separator: ' | ', segments: ['model'], warnings: ['unknown segment "modle"'] }
  );
  assert.strictEqual(out, 'M | ⚠ unknown segment "modle"');
});

test('NO_COLOR strips all ANSI, including from custom segments and separators', async () => {
  const out = await renderStatusLine(
    {},
    { separator: '\x1b[2m|\x1b[0m', segments: [() => '\x1b[31mx\x1b[0m', () => 'y'] },
    { env: { NO_COLOR: '1' } }
  );
  assert.strictEqual(out, 'x|y');
});

test('terminal_width 0 means unlimited; missing means 80', () => {
  assert.strictEqual(maxWidthFor({ terminal_width: 0 }), Infinity);
  assert.strictEqual(maxWidthFor({}), 78);
  assert.strictEqual(maxWidthFor({ terminal_width: 120 }), 118);
});

test('custom segments receive utils with data helpers and width', async () => {
  const out = await render(
    { ...active, terminal_width: 100 },
    {
      segments: [
        (p, u) => `${u.data.getModel(p)}|${u.width}|${u.formatNumber(1500)}|${typeof u.format.bar}`,
      ],
    }
  );
  assert.strictEqual(out, 'Claude Opus 4.6 (Thinking)|98|1.5k|function');
});

test('config warnings survive narrow terminals (they outrank every segment)', async () => {
  const out = await render(
    { ...active, terminal_width: 100 },
    {
      separator: ' | ',
      segments: ['model', 'cwd_branch', 'context', 'quota_gemini', 'quota_3p', 'version'],
      warnings: ['unknown theme "defualt"'],
    }
  );
  assert.match(out, /⚠ unknown theme "defualt"/, out);
});
