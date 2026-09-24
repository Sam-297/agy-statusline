// Terminal display width. Emoji and East Asian wide characters take 2 columns,
// combining marks take 0, ANSI escape sequences take none.
const ANSI_REGEX = /\x1B\[[0-9;?]*[ -/]*[@-~]|\x1B\][^\x07\x1B]*(?:\x07|\x1B\\)/g;
const ANSI_SPLIT = /(\x1B\[[0-9;?]*[ -/]*[@-~])/;

const segmenter = new Intl.Segmenter();
const WIDE =
  /[ᄀ-ᅟ⺀-〾ぁ-㏿㐀-䶿一-鿿ꀀ-꓏가-힣豈-﫿︰-﹏＀-｠￠-￦]|[\u{20000}-\u{3FFFD}]/u;
const EMOJI = /\p{Emoji_Presentation}|\p{Extended_Pictographic}️/u;
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
  let width = 0;
  for (const { segment } of segmenter.segment(line)) width += graphemeWidth(segment);
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
  for (const part of String(str).split(ANSI_SPLIT)) {
    if (part.startsWith('\x1B[')) {
      out += part;
      continue;
    }
    for (const { segment } of segmenter.segment(part)) {
      const w = graphemeWidth(segment);
      if (used + w > width - 1) return `${out}…\x1B[0m`;
      out += segment;
      used += w;
    }
  }
  return out;
}
