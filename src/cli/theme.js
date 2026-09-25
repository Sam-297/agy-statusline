import fs from 'node:fs';
import path from 'node:path';
import { listThemes, loadConfig, resolveConfig, defaultConfigSource } from '../core/config.js';
import { renderStatusLine } from '../core/renderer.js';
import { SAMPLE_PAYLOAD } from '../core/sample-payload.js';
import { atomicWriteSync } from '../core/utils.js';

// Only a `theme: '...'` that starts a line (not in a comment or inline code).
const THEME_LINE = /^(\s*theme\s*:\s*)(['"])[^'"\n]*\2/m;

// config.mjs.bak, then config.mjs.1.bak, … so an earlier backup is never overwritten.
function freeBackupPath(configPath) {
  let candidate = `${configPath}.bak`;
  for (let i = 1; fs.existsSync(candidate); i++) candidate = `${configPath}.${i}.bak`;
  return candidate;
}

// Loads `source` as it would sit at configPath (same dir, so relative imports still work).
async function themeOf(source, configPath) {
  const probe = `${configPath}.check-${process.pid}-${Date.now()}.mjs`;
  try {
    fs.writeFileSync(probe, source);
    return (await loadConfig(probe)).theme;
  } catch {
    return null;
  } finally {
    fs.rmSync(probe, { force: true });
  }
}

export async function setTheme(name, { configDir, out, err }) {
  const themes = listThemes();
  if (!name || !themes.includes(name)) {
    err(`Unknown theme "${name ?? ''}". Available: ${themes.join(', ')}`);
    return 1;
  }
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'config.mjs');
  const original = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : null;
  let source = null;
  if (original !== null && THEME_LINE.test(original)) {
    const edited = original.replace(THEME_LINE, `$1$2${name}$2`);
    // Verify the edit really selects the theme; otherwise fall back to a fresh config.
    if ((await themeOf(edited, configPath)) === name) source = edited;
  }
  if (source === null) {
    if (original !== null) {
      const backup = freeBackupPath(configPath);
      fs.copyFileSync(configPath, backup);
      out(`Backed up your previous config to ${backup}`);
    }
    source = defaultConfigSource(name);
  }
  atomicWriteSync(configPath, source);
  out(`✓ Theme set to "${name}". agy picks it up on its next refresh.`);
  return 0;
}

export function printThemes({ out }) {
  for (const name of listThemes()) out(name);
  return 0;
}

export async function preview(name, { out, err, columns }) {
  const themes = listThemes();
  if (name && !themes.includes(name)) {
    err(`Unknown theme "${name}". Available: ${themes.join(', ')}`);
    return 1;
  }
  for (const theme of name ? [name] : themes) {
    const config = await resolveConfig({ theme });
    const line = await renderStatusLine({ ...SAMPLE_PAYLOAD, terminal_width: columns }, config);
    out(`\x1b[1m${theme}\x1b[0m\n${line}\n`);
  }
  return 0;
}
