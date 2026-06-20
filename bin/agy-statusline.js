#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parsePayload } from '../src/core/parser.js';
import { loadConfig } from '../src/core/config.js';
import { renderStatusLine } from '../src/core/renderer.js';

const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log('Usage: agy-statusline [options]');
  console.log('Options:');
  console.log('  --help     Show help');
  process.exit(0);
}



// Read stdin with timeout
let input = '';
const timeout = setTimeout(() => {
  process.exit(0);
}, 1500);

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  input += chunk;
  if (Buffer.byteLength(input, 'utf8') > 64 * 1024) {
    process.exit(1);
  }
});

process.stdin.on('end', async () => {
  clearTimeout(timeout);
  const payload = parsePayload(input);
  if (!payload) {
    process.exit(0);
  }
  const configPath = path.join(os.homedir(), '.config', 'agy-statusline', 'config.js');
  const config = await loadConfig(configPath);
  const output = renderStatusLine(payload, config);
  console.log(output);
});
