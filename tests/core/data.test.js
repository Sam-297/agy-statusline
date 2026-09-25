import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  getModel,
  getCwd,
  getCwdName,
  readGitBranch,
  getBranch,
  getContext,
  getQuota,
} from '../../src/core/data.js';
import { fixture } from '../helpers.js';

const active = fixture('linux-git-active');
const startup = fixture('linux-startup');

test('getModel', () => {
  assert.strictEqual(getModel(active), 'Claude Opus 4.6 (Thinking)');
  assert.strictEqual(getModel(startup), null);
  assert.strictEqual(getModel(undefined), null);
});

test('getCwd prefers workspace.current_dir, falls back to process.cwd()', () => {
  assert.strictEqual(getCwd({ workspace: { current_dir: '/a' }, cwd: '/b' }), '/a');
  assert.strictEqual(getCwd({ cwd: '/b' }), '/b');
  assert.strictEqual(getCwd({}), process.cwd());
});

test('getContext matches agy used_percentage', () => {
  const c = getContext(active);
  assert.strictEqual(c.used, active.context_window.total_input_tokens);
  assert.strictEqual(c.total, 250000);
  assert.strictEqual(c.pct, active.context_window.used_percentage);
  assert.strictEqual(getContext(startup), null); // context_window_size is 0 at startup
});

test('getContext computes pct when used_percentage is missing', () => {
  const c = getContext({ context_window: { total_input_tokens: 50, context_window_size: 200 } });
  assert.strictEqual(c.pct, 25);
});

test('getQuota returns used % and reset times', () => {
  const q = getQuota(
    {
      quota: {
        'gemini-5h': { remaining_fraction: 0.735, reset_time: '2026-09-24T15:18:21Z' },
        'gemini-weekly': { remaining_fraction: 0.2, reset_in_seconds: 60 },
      },
    },
    'gemini',
    Date.parse('2026-09-24T10:00:00Z')
  );
  assert.deepStrictEqual(q.h5, { usedPct: 27, resetAt: new Date('2026-09-24T15:18:21Z') });
  assert.deepStrictEqual(q.weekly, { usedPct: 80, resetAt: new Date('2026-09-24T10:01:00Z') });
  assert.strictEqual(getQuota({ quota: {} }, 'gemini'), null);
  assert.strictEqual(getQuota(active, 'nope'), null);
  assert.ok(getQuota(active, '3p').h5);
});

function tmpRepo(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-git-'));
  for (const [rel, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    fs.writeFileSync(path.join(root, rel), content);
  }
  return root;
}

test('readGitBranch: branch, nested dir, detached, worktree, none', () => {
  const repo = tmpRepo({ '.git/HEAD': 'ref: refs/heads/feature/x\n', 'src/deep/file': '' });
  assert.strictEqual(readGitBranch(repo), 'feature/x');
  assert.strictEqual(readGitBranch(path.join(repo, 'src', 'deep')), 'feature/x');

  const detached = tmpRepo({ '.git/HEAD': 'a1b2c3d4e5f6a7b8c9d0\n' });
  assert.strictEqual(readGitBranch(detached), 'a1b2c3d');

  const wt = tmpRepo({ 'main/.git/worktrees/wt/HEAD': 'ref: refs/heads/wt-branch\n' });
  fs.mkdirSync(path.join(wt, 'wt'));
  fs.writeFileSync(path.join(wt, 'wt', '.git'), 'gitdir: ../main/.git/worktrees/wt\n');
  assert.strictEqual(readGitBranch(path.join(wt, 'wt')), 'wt-branch');

  const none = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-nogit-'));
  assert.strictEqual(readGitBranch(none), null);
});

test('getBranch: legacy git.branch, non-git vcs, filesystem', () => {
  assert.strictEqual(getBranch({ git: { branch: 'legacy' } }), 'legacy');
  assert.strictEqual(getBranch({ vcs: { type: 'hg' }, cwd: process.cwd() }), null);
  const repo = tmpRepo({ '.git/HEAD': 'ref: refs/heads/main\n' });
  assert.strictEqual(getBranch({ vcs: { type: 'git' }, cwd: repo }), 'main');
});

test('getCwdName: ~ for home, basename otherwise, for / and \\ paths', () => {
  assert.strictEqual(getCwdName({ cwd: os.homedir() }), '~');
  assert.strictEqual(getCwdName({ cwd: '/home/user/projects/demo/' }), 'demo');
  assert.strictEqual(getCwdName({ cwd: 'C:\\Users\\user\\code\\app' }), 'app');
  assert.strictEqual(getCwdName({ cwd: '/' }), '/');
});

test('readGitBranch: reftable repos (HEAD points at .invalid) show no branch rather than a wrong one', () => {
  const repo = tmpRepo({ '.git/HEAD': 'ref: refs/heads/.invalid\n' });
  assert.strictEqual(readGitBranch(repo), null);
});
