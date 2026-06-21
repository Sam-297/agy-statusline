import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';
import { getConfigDir, getThemesDir, atomicWriteSync } from './utils.js';

function validateName(name) {
  if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid name: use lowercase letters, numbers, hyphens');
  return name;
}

export function handleThemeCommand(args) {
  const configDir = getConfigDir();
  const themesDir = getThemesDir();
  const configPath = path.join(configDir, 'config.mjs');
  
  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  if (!fs.existsSync(themesDir)) fs.mkdirSync(themesDir, { recursive: true });

  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const builtInThemesDir = path.join(__dirname, '..', '..', 'themes');

  if (args.includes('--list-themes')) {
    console.error('Built-in Themes:');
    if (fs.existsSync(builtInThemesDir)) {
      const items = fs.readdirSync(builtInThemesDir);
      items.filter(i => fs.statSync(path.join(builtInThemesDir, i)).isDirectory() && !i.startsWith('.')).forEach(i => console.error(` - ${i}`));
    }
    console.error('\nCustom Themes:');
    fs.readdirSync(themesDir).filter(f => f.endsWith('.mjs')).forEach(f => console.error(` - ${f.replace('.mjs', '')}`));
    return true;
  }

  const saveIdx = args.indexOf('--save-theme');
  if (saveIdx !== -1 && args[saveIdx + 1]) {
    const saveName = validateName(args[saveIdx + 1]);
    if (!fs.existsSync(configPath)) throw new Error('No active config to save.');
    const targetSave = path.join(themesDir, `${saveName}.mjs`);
    atomicWriteSync(targetSave, fs.readFileSync(configPath, 'utf8'));
    console.error(`Saved custom theme: ${saveName}`);
    return true;
  }

  const loadIdx = args.indexOf('--load-theme');
  if (loadIdx !== -1 && args[loadIdx + 1]) {
    const loadName = validateName(args[loadIdx + 1]);
    let sourceLoad = path.join(themesDir, `${loadName}.mjs`);
    if (!fs.existsSync(sourceLoad)) {
      sourceLoad = path.join(builtInThemesDir, loadName, 'config.mjs');
      if (!fs.existsSync(sourceLoad)) throw new Error(`Theme not found: ${loadName}`);
    }
    const content = fs.readFileSync(sourceLoad, 'utf8');
    atomicWriteSync(configPath, content);
    console.error(`Loaded theme: ${loadName}`);
    return true;
  }

  const delIdx = args.indexOf('--delete-theme');
  if (delIdx !== -1 && args[delIdx + 1]) {
    const delName = validateName(args[delIdx + 1]);
    const targetDel = path.join(themesDir, `${delName}.mjs`);
    if (fs.existsSync(targetDel)) {
      fs.unlinkSync(targetDel);
      console.error(`Deleted custom theme: ${delName}`);
    } else {
      console.error(`Custom theme not found: ${delName}`);
    }
    return true;
  }

  return false;
}
