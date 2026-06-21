import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import url from 'node:url';
import { getConfigDir, atomicWriteSync } from './utils.js';

export function runSetup() {
  const configDir = getConfigDir();
  const configPath = path.join(configDir, 'config.mjs');

  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }

  if (!fs.existsSync(configPath)) {
    const defaultConfig = `export default {\n  separator: " • ",\n  segments: ["model", "cwd_branch", "tokens"]\n};\n`;
    atomicWriteSync(configPath, defaultConfig);
    console.error('Created default config at', configPath);
  } else {
    console.error('Config already exists at', configPath);
  }

  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const rootDir = path.join(__dirname, '..', '..');
  const isWin = os.platform() === 'win32';
  const ext = isWin ? '.cmd' : '.sh';
  const hookPath = path.join(rootDir, 'hooks', `status-line${ext}`);

  const jsonSnippet = JSON.stringify({
    statusLine: {
      type: "custom",
      command: hookPath,
      enabled: true
    }
  }, null, 2);

  if (process.stdout.isTTY) {
    console.error('\nTo activate the status line, add this to your ~/.gemini/antigravity-cli/settings.json:\n');
  }
  process.stdout.write(jsonSnippet + '\n\n');
}
