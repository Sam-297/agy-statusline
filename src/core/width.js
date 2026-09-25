// Terminal display width. Emoji and East Asian wide characters take 2 columns,
// combining marks take 0, ANSI escape sequences take none.
const ANSI_REGEX = /\x1B\[[0-9;?]*[ -/]*[@-~]|\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g;
const ANSI_SPLIT = /(\x1B\[[0-9;?]*[ -/]*[@-~]|\x1B\][^\x07\x1B]*(?:\x07|\x1B\\))/;

// Minimal grapheme clustering (combining marks, ZWJ sequences, variation selectors,
// skin tones, flag pairs). Intl.Segmenter would do this too but costs ~10 ms per process.
const ZWJ = String.fromCodePoint(0x200d);
const JOINS_PREVIOUS = /\p{Mn}|\p{Me}|\p{Cf}|\p{Emoji_Modifier}/u;
const REGIONAL_INDICATOR = /\p{Regional_Indicator}/u;

function* graphemes(str) {
  let cluster = '';
  let afterZwj = false;
  let openFlag = false;
  for (const ch of str) {
    const isRegional = REGIONAL_INDICATOR.test(ch);
    const joins =
      cluster !== '' && (afterZwj || JOINS_PREVIOUS.test(ch) || (isRegional && openFlag));
    if (cluster !== '' && !joins) {
      yield cluster;
      cluster = '';
    }
    openFlag = isRegional && !joins;
    cluster += ch;
    afterZwj = ch === ZWJ;
  }
  if (cluster !== '') yield cluster;
}

const ASCII = /^[\x20-\x7E]*$/;
const WIDE =
  /[\u1100-\u115F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DBF\u4E00-\u9FFF\uA000-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]|[\u{20000}-\u{3FFFD}]/u;
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}\uFE0F/u;
const ZERO_WIDTH = /^(?:\p{Mn}|\p{Me}|\p{Cf})+$/u;

export function stripAnsi(str) {
  return String(str ?? '').replace(ANSI_REGEX, '');
}

function graphemeWidth(grapheme) {
  if (ZERO_WIDTH.test(grapheme)) return 0;
  if (EMOJI.test(grapheme) || WIDE.test(grapheme)) return 2;
  return 1;
}

function lineWidth(line) {
  if (ASCII.test(line)) return line.length;
  let width = 0;
  for (const grapheme of graphemes(line)) width += graphemeWidth(grapheme);
  return width;
}

export function displayWidth(str) {
  let max = 0;
  for (const line of stripAnsi(str).split('\n')) max = Math.max(max, lineWidth(line));
  return max;
}

export function truncate(str, width) {
  if (width <= 0) return '';
  if (displayWidth(str) <= width) return str;
  let out = '';
  let used = 0;
  let linkOpen = false; // OSC 8 hyperlink started but not yet closed
  for (const part of String(str).split(ANSI_SPLIT)) {
    if (part.startsWith('\x1B')) {
      if (part.startsWith('\x1B]8;')) linkOpen = !/^\x1B\]8;[^;]*;(?:\x07|\x1B\\)$/.test(part);
      out += part;
      continue;
    }
    for (const grapheme of graphemes(part)) {
      const w = graphemeWidth(grapheme);
      if (used + w > width - 1) return `${out}…\x1B[0m${linkOpen ? '\x1B]8;;\x07' : ''}`;
      out += grapheme;
      used += w;
    }
  }
  return out;
}
