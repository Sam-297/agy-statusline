import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { renderQuota } from '../../../src/features/quota/quota.js';
import colors from '../../../src/core/colors.js';

test('renderQuota handles missing quota', () => {
  assert.strictEqual(renderQuota({}, 'gemini'), '');
});

test('renderQuota formats google quota with percentage and time', () => {
  const payload = {
    quota: {
      'gemini-5h': { remaining_fraction: 0.735, reset_time: "2026-06-20T14:00:00Z" },
      'gemini-weekly': { remaining_fraction: 0.10, reset_time: "2026-06-23T14:00:00Z" }
    }
  };
  const result = renderQuota(payload, 'gemini', {
    formatTime: () => '14:00',
    formatDayTime: () => 'Fri 14:00'
  });
  
  const exp = `${colors.googleBlue('G·')}${colors.white('5h')} ${colors.green('27%')} ${colors.dim('@14:00')}${colors.dim(', ')}${colors.white('7d')} ${colors.red('90%')} ${colors.dim('@Fri 14:00')}`;
  assert.strictEqual(result, exp);
});

test('renderQuota uses Intl.DateTimeFormat for timezone conversion', () => {
  const code = fs.readFileSync(path.resolve(import.meta.dirname, '../../../src/features/quota/quota.js'), 'utf8');
  assert.ok(code.includes('Intl.DateTimeFormat'), 'Should use Intl.DateTimeFormat for timezones');
});
