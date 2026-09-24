import fs from 'node:fs';
import path from 'node:path';
import { listThemes, resolveConfig, defaultConfigSource } from '../core/config.js';
import { renderStatusLine } from '../core/renderer.js';
import { SAMPLE_PAYLOAD } from '../core/sample-payload.js';
import { atomicWriteSync } from '../core/utils.js';

const THEME_LINE = /(\btheme\s*:\s*)(['"])[^'"\n]*\2/;

export function setTheme(name, { configDir, out, err }) {
  const themes = listThemes();
  if (!name || !themes.includes(name)) {
    err(`Unknown theme "${name ?? ''}". Available: ${themes.join(', ')}`);
    return 1;
  }
  fs.mkdirSync(configDir, { recursive: true });
  const configPath = path.join(configDir, 'config.mjs');
  let source = fs.existsSync(configPath) ? fs.readFileSync(configPath, 'utf8') : null;
  if (source !== null && THEME_LINE.test(source)) {
    source = source.replace(THEME_LINE, `$1$2${name}$2`);
  } else {
    if (source !== null) {
      fs.copyFileSync(configPath, `${configPath}.bak`);
      out(`Backed up your previous config to ${configPath}.bak`);
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
