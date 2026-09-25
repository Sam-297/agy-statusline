import test from 'node:test';
import assert from 'node:assert';
import { stripAnsi, displayWidth, truncate } from '../../src/core/width.js';

test('stripAnsi removes SGR codes', () => {
  assert.strictEqual(stripAnsi('\x1b[38;2;1;2;3mhi\x1b[0m'), 'hi');
  assert.strictEqual(stripAnsi(undefined), '');
});

const cases = [
  ['', 0],
  ['abc', 3],
  ['\x1b[31mred\x1b[0m', 3],
  ['😀', 2],
  ['🔒', 2],
  ['中文', 4],
  ['\u{1F468}\u200D\u{1F469}\u200D\u{1F467}', 2], // family: ZWJ sequence is one glyph
  ['🇺🇸', 2],
  ['\u{1F44D}\u{1F3FD}', 2], // thumbs up + skin tone modifier
  ['🇺🇸🇫🇷', 4], // two flags = two regional-indicator pairs
  ['⚠', 1],
  ['\u26A0\uFE0F', 2], // warning sign + emoji presentation selector
  ['e\u0301', 1], // e + combining acute accent
  ['─╭├╰█░▓▒', 8],
  ['a\nlonger', 6],
];
for (const [input, expected] of cases) {
  test(`displayWidth(${JSON.stringify(input)}) === ${expected}`, () => {
    assert.strictEqual(displayWidth(input), expected);
  });
}

test('truncate leaves short strings alone', () => {
  assert.strictEqual(truncate('abc', 5), 'abc');
});

test('truncate cuts to width including the ellipsis', () => {
  const out = truncate('abcdefgh', 5);
  assert.strictEqual(stripAnsi(out), 'abcd…');
  assert.strictEqual(displayWidth(out), 5);
});

test('truncate keeps ANSI codes and never splits a wide char', () => {
  const out = truncate('\x1b[31m中文中文\x1b[0m', 5);
  assert.strictEqual(stripAnsi(out), '中文…');
  assert.ok(out.startsWith('\x1b[31m'));
  assert.ok(out.endsWith('\x1b[0m'));
});

test('truncate to 0 or less returns empty', () => {
  assert.strictEqual(truncate('abc', 0), '');
});

test('truncate never cuts an OSC 8 hyperlink sequence in half', () => {
  const link = '\x1b]8;;https://example.com/a/very/long/url\x07click here please\x1b]8;;\x07';
  const out = truncate(link, 10);
  assert.strictEqual(stripAnsi(out), 'click her…');
  assert.ok(out.startsWith('\x1b]8;;https://example.com/a/very/long/url\x07'), JSON.stringify(out));
});
