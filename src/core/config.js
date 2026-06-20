import fs from 'node:fs';
import path from 'node:path';

import colors from './colors.js';

const DEFAULTS = {
  separator: colors.dim(' | '),
  hide_openai: true,
  google_label: 'G',
  anthropic_label: 'C',
  segments: [
    'model',
    'cwd_branch',
    'tokens',
    'quota_gemini',
    'quota_anthropic',
    'version'
  ]
};

export async function loadConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    return { ...DEFAULTS };
  }
  
  try {
    const absolutePath = path.resolve(configPath);
    // Use dynamic import, append timestamp to bypass cache if needed
    const userConfig = await import(`file://${absolutePath}?t=${Date.now()}`);
    return { ...DEFAULTS, ...(userConfig.default || {}) };
  } catch (err) {
    // Print the error so the user can actually fix their theme syntax!
    console.error(`\x1b[38;2;255;85;85m[agy-statusline] Config Error: ${err.message}\x1b[0m`);
    return { ...DEFAULTS };
  }
}
