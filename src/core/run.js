// Render mode: what agy runs. Always exits 0 and always prints one (possibly empty) line.
import path from 'node:path';
import { parsePayload } from './parser.js';
import { loadConfig } from './config.js';
import { renderStatusLine } from './renderer.js';
import { getConfigDir } from './utils.js';

export const STDIN_TIMEOUT_MS = 1000;
export const HARD_DEADLINE_MS = 3000; // agy kills us at ~4-5 s and prints an error into the chat
export const MAX_INPUT_BYTES = 1024 * 1024;

export function readStdin(stream, timeoutMs = STDIN_TIMEOUT_MS) {
  return new Promise((resolve) => {
    let data = '';
    let settled = false;
    const done = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const timer = setTimeout(() => done(data), timeoutMs);
    stream.setEncoding?.('utf8');
    stream.on('data', (chunk) => {
      data += chunk;
      if (data.length > MAX_INPUT_BYTES) done(null);
    });
    stream.on('end', () => done(data));
    stream.on('error', () => done(null));
  });
}

export async function renderFromInput(
  input,
  {
    configPath = path.join(getConfigDir(), 'config.mjs'),
    env = process.env,
    platform = process.platform,
  } = {}
) {
  let output = '';
  try {
    const payload = parsePayload(input);
    if (payload) output = await renderStatusLine(payload, await loadConfig(configPath), { env });
  } catch (err) {
    output = `⚠ agy-statusline: ${err?.message ?? err}`;
  }
  return platform === 'win32' ? output.replace(/(?<!\r)\n/g, '\r\n') : output;
}

export async function runRender({ stdin = process.stdin, stdout = process.stdout } = {}) {
  setTimeout(() => process.exit(0), HARD_DEADLINE_MS);
  stdout.on('error', () => process.exit(0)); // EPIPE: agy went away
  const output = await renderFromInput(await readStdin(stdin));
  await new Promise((resolve) => stdout.write(output + '\n', resolve)); // pipes are async on Windows
}
