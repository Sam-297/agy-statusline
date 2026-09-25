import test from 'node:test';
import assert from 'node:assert';
import os from 'node:os';
import { SEGMENTS, resolveSegment, isKnownSegment } from '../../src/core/segments.js';
import { stripAnsi } from '../../src/core/width.js';
import { fixture, FIXTURES } from '../helpers.js';

const plain = (name, payload) => stripAnsi(resolveSegment(name).render(payload));
const active = fixture('linux-git-active');

test('every built-in renders a string for every real fixture and for {}', () => {
  for (const name of Object.keys(SEGMENTS)) {
    for (const f of [...FIXTURES.map(fixture), {}]) {
      const out = SEGMENTS[name].render(f);
      assert.strictEqual(typeof out, 'string', `${name} returned ${typeof out}`);
      assert.ok(!/undefined|NaN|\[object/.test(out), `${name} rendered junk: ${out}`);
    }
  }
});

test('model / version / context', () => {
  assert.strictEqual(plain('model', active), 'Claude Opus 4.6 (Thinking)');
  assert.strictEqual(plain('version', active), `v${active.version}`);
  assert.strictEqual(plain('version', { version: '' }), '');
  assert.match(plain('context', active), /^21\.4k\/250k \(9%\)$/);
  assert.strictEqual(plain('context', fixture('linux-startup')), '');
  assert.match(plain('context_bar', active), /^\[█░{9}\] 9%$/);
});

test('quota shows used % with G and 3P labels', () => {
  const p = {
    quota: {
      'gemini-5h': { remaining_fraction: 0.73 },
      '3p-weekly': { remaining_fraction: 0.09 },
    },
  };
  assert.strictEqual(plain('quota_gemini', p), 'G·5h 27%');
  assert.strictEqual(plain('quota_3p', p), '3P·7d 91%');
});

test('cwd shows ~ for home and the basename otherwise, for / and \\ paths', () => {
  assert.strictEqual(plain('cwd', { cwd: os.homedir() }), '~');
  assert.strictEqual(plain('cwd', { cwd: '/home/user/projects/demo' }), 'demo');
  assert.strictEqual(plain('cwd', { cwd: 'C:\\Users\\user\\code\\app' }), 'app');
  assert.strictEqual(plain('cwd_branch', { cwd: '/x/demo', git: { branch: 'main' } }), 'demo@main');
});

test('privacy: email and session id only through their own segments', () => {
  const p = { email: 'jane.doe@example.com', session_id: 'c4557d34-6579-4067-a764-73f79e0dec56' };
  assert.strictEqual(plain('email_masked', p), 'j***@example.com');
  assert.strictEqual(plain('session_id_short', p), '#c4557d34');
});

test('aliases and payload paths resolve; typos do not', () => {
  assert.strictEqual(resolveSegment('tokens').name, 'context');
  assert.strictEqual(resolveSegment('quota_anthropic').name, 'quota_3p');
  assert.strictEqual(
    stripAnsi(resolveSegment('context_window.context_window_size').render(active)),
    '250000'
  );
  assert.strictEqual(resolveSegment('plan_tier').name, 'plan_tier');
  assert.strictEqual(resolveSegment('terminal_width').render({ terminal_width: 90 }), '90');
  assert.strictEqual(resolveSegment('vcs').render(active), ''); // objects render nothing
  assert.strictEqual(isKnownSegment('modle'), false);
  assert.strictEqual(isKnownSegment('artifact_count'), false);
  assert.strictEqual(isKnownSegment('__proto__.x'), false);
});

test('email_masked copes with an empty local part', () => {
  assert.strictEqual(plain('email_masked', { email: '@example.com' }), '***@example.com');
});
