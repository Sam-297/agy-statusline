// Everything that knows the agy payload shape lives here. See docs/agy-contract.md.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

export function getModel(payload) {
  const name = payload?.model?.display_name;
  return typeof name === 'string' && name ? name : null;
}

export function getCwd(payload) {
  const cwd = payload?.workspace?.current_dir || payload?.cwd;
  return typeof cwd === 'string' && cwd ? cwd : process.cwd();
}

// Folder name for display: '~' for the home directory, else the last path component.
export function getCwdName(payload) {
  const cwd = getCwd(payload);
  const norm = (p) =>
    p
      .replace(/^[a-zA-Z]:/, '')
      .replace(/\\/g, '/')
      .replace(/\/+$/, '')
      .toLowerCase();
  const home = os.homedir();
  if (home && norm(cwd) === norm(home)) return '~';
  return cwd.split(/[\\/]/).filter(Boolean).pop() || cwd;
}

function readSmall(file, max) {
  try {
    return fs.readFileSync(file, 'utf8').slice(0, max).trim();
  } catch {
    return null;
  }
}

// agy sends no branch name (only vcs.type), so read HEAD from disk. No `git` spawn.
export function readGitBranch(startDir) {
  let dir = startDir;
  try {
    dir = fs.realpathSync(startDir);
  } catch {}
  for (;;) {
    const gitPath = path.join(dir, '.git');
    let stat = null;
    try {
      stat = fs.statSync(gitPath);
    } catch {}
    if (stat) {
      let gitDir = gitPath;
      if (stat.isFile()) {
        const match = /^gitdir:\s*(.+)$/m.exec(readSmall(gitPath, 1024) ?? '');
        if (!match) return null;
        gitDir = path.resolve(dir, match[1].trim());
      }
      const head = readSmall(path.join(gitDir, 'HEAD'), 256);
      if (!head) return null;
      const ref = /^ref:\s*refs\/heads\/(.+)$/m.exec(head);
      // Reftable repos keep the real HEAD elsewhere and point this one at '.invalid'.
      if (ref) return ref[1].trim() === '.invalid' ? null : ref[1].trim();
      return /^[0-9a-f]{7,}/i.test(head) ? head.slice(0, 7) : null;
    }
    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function getBranch(payload) {
  const legacy = payload?.git?.branch; // agy <= 1.0.x
  if (typeof legacy === 'string' && legacy) return legacy;
  if (payload?.vcs?.type && payload.vcs.type !== 'git') return null;
  return readGitBranch(getCwd(payload));
}

export function getContext(payload) {
  const cw = payload?.context_window;
  const total = cw?.context_window_size;
  if (typeof total !== 'number' || total <= 0) return null;
  const used = Number(cw.total_input_tokens) || 0;
  const pct = typeof cw.used_percentage === 'number' ? cw.used_percentage : (used / total) * 100;
  return { used, total, pct };
}

const QUOTA_BUCKETS = { gemini: ['gemini-5h', 'gemini-weekly'], '3p': ['3p-5h', '3p-weekly'] };

function readBucket(bucket, now) {
  if (typeof bucket?.remaining_fraction !== 'number') return null;
  const usedPct = Math.min(100, Math.max(0, Math.round((1 - bucket.remaining_fraction) * 100)));
  let resetAt = null;
  if (typeof bucket.reset_time === 'string' && !Number.isNaN(Date.parse(bucket.reset_time))) {
    resetAt = new Date(bucket.reset_time);
  } else if (Number.isFinite(bucket.reset_in_seconds)) {
    resetAt = new Date(now + bucket.reset_in_seconds * 1000);
  }
  return { usedPct, resetAt };
}

export function getQuota(payload, provider, now = Date.now()) {
  const keys = QUOTA_BUCKETS[provider];
  const quota = payload?.quota;
  if (!keys || !quota) return null;
  const h5 = readBucket(quota[keys[0]], now);
  const weekly = readBucket(quota[keys[1]], now);
  return h5 || weekly ? { h5, weekly } : null;
}
