const RESET = '\x1b[0m';

const wrap = (code, text) => {
  if (process.env.NO_COLOR) return text;
  return `${code}${text}${RESET}`;
};

const ANSI_REGEX = /\x1B\[[0-9;?]*[a-zA-Z]/g;
export const stripAnsi = (str) => {
  try { return typeof str === 'string' ? str.replace(ANSI_REGEX, '') : String(str).replace(ANSI_REGEX, ''); }
  catch(e) { return ''; }
};

export default {
  dim: (text) => wrap('\x1b[2m', text),
  blue: (text) => wrap('\x1b[38;2;0;153;255m', text),
  orange: (text) => wrap('\x1b[38;2;255;176;85m', text),
  green: (text) => wrap('\x1b[38;2;0;160;0m', text),
  cyan: (text) => wrap('\x1b[38;2;46;149;153m', text),
  red: (text) => wrap('\x1b[38;2;255;85;85m', text),
  yellow: (text) => wrap('\x1b[38;2;230;200;0m', text),
  purple: (text) => wrap('\x1b[38;2;167;139;250m', text),
  white: (text) => wrap('\x1b[38;2;220;220;220m', text),
  googleBlue: (text) => wrap('\x1b[38;2;66;133;244m', text),
  claudeOrange: (text) => wrap('\x1b[38;2;217;119;87m', text),
  openaiGreen: (text) => wrap('\x1b[38;2;16;163;127m', text),
  stripAnsi
};
