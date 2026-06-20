import fs from 'node:fs';
import path from 'node:path';

const DEFAULTS = {
  separator: ' | ',
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
    const userConfig = await import(`file://${absolutePath}`);
    return { ...DEFAULTS, ...(userConfig.default || {}) };
  } catch (err) {
    // If import fails (e.g. syntax error), fallback to defaults
    return { ...DEFAULTS };
  }
}
