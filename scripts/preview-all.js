import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { renderStatusLine } from '../src/core/renderer.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const themesDir = path.join(__dirname, '..', 'themes');

const mockPayload = {
  version: "1.0.0",
  model: { display_name: "gemini-1.5-pro" },
  git: { branch: "main" },
  context_window: { total_input_tokens: 4500, total_output_tokens: 1500, context_window_size: 200000 },
  quota: {
    'gemini-5h': { remaining_fraction: 0.8 },
    'anthropic-5h': { remaining_fraction: 0.5 }
  },
  email: "developer@antigravity.io",
  session_id: "s123abc",
  agent_state: "idle",
  plan_tier: "pro",
  product: "agy",
  artifact_count: 3,
  sandbox: { enabled: true },
  terminal_width: 80
};

async function previewAll() {
  console.log('\n--- AGY-STATUSLINE THEME PREVIEWS ---\n');
  const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.js'));
  
  for (const file of files) {
    const themeName = file.replace('.js', '');
    const module = await import(url.pathToFileURL(path.join(themesDir, file)).href);
    const config = module.default;
    
    console.log(`\x1b[1mTheme: ${themeName}\x1b[0m`);
    console.log('\x1b[2m----------------------------------------\x1b[0m');
    const output = await renderStatusLine(mockPayload, config);
    console.log(output);
    console.log('\n');
  }
}

previewAll().catch(console.error);
