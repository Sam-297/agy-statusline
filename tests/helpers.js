import fs from 'node:fs';
import path from 'node:path';

const dir = path.join(import.meta.dirname, 'fixtures', 'payloads');

export function fixture(name) {
  return JSON.parse(fs.readFileSync(path.join(dir, `${name}.json`), 'utf8'));
}

export const FIXTURES = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.slice(0, -5));
