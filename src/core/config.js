import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import colors from './colors.js';
import { isKnownSegment } from './segments.js';

export const THEMES_DIR = url.fileURLToPath(new URL('../../themes/', import.meta.url));
export const DEFAULT_THEME = 'default';

export function listThemes() {
  return fs
    .readdirSync(THEMES_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((f) => f.slice(0, -3))
    .sort();
}

async function importDefault(file) {
  return (await import(url.pathToFileURL(file).href)).default;
}

export async function loadTheme(name) {
  if (typeof name !== 'string' || !listThemes().includes(name)) return null;
  return importDefault(path.join(THEMES_DIR, `${name}.js`));
}

export async function resolveConfig(user, warnings = []) {
  let themeName = user.theme ?? DEFAULT_THEME;
  let theme = await loadTheme(themeName);
  if (!theme) {
    warnings.push(`unknown theme "${themeName}"`);
    themeName = DEFAULT_THEME;
    theme = await loadTheme(DEFAULT_THEME);
  }
  const merged = { ...theme, ...user };

  let segments = merged.segments;
  if (!Array.isArray(segments)) {
    warnings.push('segments must be an array');
    segments = theme.segments;
  }
  const valid = [];
  for (const s of segments) {
    if (typeof s === 'string') {
      if (!isKnownSegment(s)) warnings.push(`unknown segment "${s}"`);
      valid.push(s);
    } else if (typeof s === 'function' || typeof s?.render === 'function') {
      valid.push(s);
    } else {
      warnings.push(`invalid segment (${typeof s})`);
    }
  }

  const separator = typeof merged.separator === 'string' ? merged.separator : colors.dim(' | ');
  return { ...merged, theme: themeName, separator, segments: valid, warnings };
}

export async function loadConfig(configPath) {
  const warnings = [];
  let user = {};
  if (fs.existsSync(configPath)) {
    try {
      const exported = await importDefault(configPath);
      if (Array.isArray(exported)) user = { segments: exported };
      else if (exported && typeof exported === 'object') user = exported;
      else warnings.push('config.mjs must `export default` an object');
    } catch (err) {
      warnings.push(`config error: ${String(err?.message ?? err).split('\n')[0]}`);
    }
  }
  return resolveConfig(user, warnings);
}

export function defaultConfigSource(theme = DEFAULT_THEME) {
  return `// agy-statusline config. List themes: agy-statusline themes
// Docs: https://github.com/Sam-297/agy-statusline/blob/main/themes/README.md
export default {
  theme: '${theme}',
  // Override the theme's layout, e.g.:
  // segments: ['model', 'cwd_branch', 'context', 'quota_gemini'],
  // separator: ' | ',
};
`;
}
