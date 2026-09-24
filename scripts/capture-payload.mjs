#!/usr/bin/env node
// Records what agy sends to a statusLine command, for building the agy contract doc.
// Usage (as the agy statusLine command):
//   node capture-payload.mjs                      -> log, print a short "capturing" line
//   node capture-payload.mjs <path/to/bin>        -> log, then render with that bin (passthrough)
// Log: captures/payloads.jsonl next to this script. One JSON object per invocation.
import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { spawnSync } from 'node:child_process';

const started = process.hrtime.bigint();
const here = path.dirname(url.fileURLToPath(import.meta.url));
const logDir = path.join(here, 'captures');
const passthroughBin = process.argv[2];

function parentCmdline() {
  try {
    return fs.readFileSync(`/proc/${process.ppid}/cmdline`, 'utf8').split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (c) => (input += c));
process.stdin.on('end', () => {
  const stdinMs = Number(process.hrtime.bigint() - started) / 1e6;
  const envKeys = ['TERM', 'COLUMNS', 'LINES', 'NO_COLOR', 'FORCE_COLOR', 'COLORTERM',
    'WT_SESSION', 'TERM_PROGRAM', 'NODE_OPTIONS', 'LANG', 'SHELL', 'ComSpec', 'PSModulePath'];
  const env = Object.fromEntries(envKeys.filter((k) => k in process.env).map((k) => [k, process.env[k]]));

  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    payload = { __raw: input };
  }

  let output = `capturing… ${payload?.model?.display_name ?? ''}`;
  let passthrough = null;
  if (passthroughBin) {
    const res = spawnSync(process.execPath, [passthroughBin], { input, encoding: 'utf8' });
    output = res.stdout ?? '';
    passthrough = { status: res.status, stderr: res.stderr, stdoutBytes: output.length };
  }

  const record = {
    ts: new Date().toISOString(),
    platform: process.platform,
    node: process.version,
    argv: process.argv,
    execArgv: process.execArgv,
    cwd: process.cwd(),
    ppid: process.ppid,
    parentCmdline: parentCmdline(),
    stdinIsTTY: process.stdin.isTTY ?? false,
    stdoutIsTTY: process.stdout.isTTY ?? false,
    stdoutColumns: process.stdout.columns ?? null,
    stdinBytes: Buffer.byteLength(input),
    stdinMs,
    env,
    passthrough,
    payload,
  };
  try {
    fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'payloads.jsonl'), JSON.stringify(record) + '\n');
  } catch {
    // never break the host's status line because logging failed
  }
  process.stdout.write(output.endsWith('\n') ? output : output + '\n');
});
