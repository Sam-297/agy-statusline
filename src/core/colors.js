const RESET = '\x1b[0m';

const wrap = (code, text) => {
  if (process.env.NO_COLOR) return text;
  return `${code}${text}${RESET}`;
};

export default {
  dim: (text) => wrap('\x1b[2m', text),
  green: (text) => wrap('\x1b[32m', text),
  orange: (text) => wrap('\x1b[38;5;208m', text),
  blue: (text) => wrap('\x1b[34m', text),
  red: (text) => wrap('\x1b[31m', text),
  yellow: (text) => wrap('\x1b[33m', text),
};
