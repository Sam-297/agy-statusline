// Registers agy-statusline as agy's status line command. Rules: docs/agy-contract.md
// (Windows agy splits the command on spaces and keeps quotes literally).
import fs from 'node:fs';
import path from 'node:path';
import { atomicWriteSync } from '../core/utils.js';
import { defaultConfigSource } from '../core/config.js';

export const PACKAGE_NAME = '@sam-297/agy-statusline';
export const BIN_NAME = 'agy-statusline';

export const agySettingsPath = (home) =>
  path.join(home, '.gemini', 'antigravity-cli', 'settings.json');
const statePath = (configDir) => path.join(configDir, 'previous-statusline.json');
const isOurs = (statusLine) =>
  typeof statusLine?.command === 'string' && statusLine.command.includes(BIN_NAME);

function realpath(p) {
  try {
    return fs.realpathSync(p);
  } catch {
    return p;
  }
}

export function findOnPath(name, env, platform) {
  const pathVar = env.PATH ?? env.Path ?? '';
  const delimiter = platform === 'win32' ? ';' : ':';
  const exts =
    platform === 'win32' ? (env.PATHEXT ?? '.COM;.EXE;.BAT;.CMD').split(';').filter(Boolean) : [''];
  for (const dir of pathVar.split(delimiter)) {
    if (!dir) continue;
    for (const ext of exts) {
      const candidate = path.join(dir, name + ext.toLowerCase());
      if (fs.existsSync(candidate)) return candidate;
    }
  }
  return null;
}

// npm on Windows puts <prefix>/agy-statusline.cmd next to <prefix>/node_modules/<pkg>.
function isOurWindowsShim(found, scriptPath) {
  const target = path.join(
    path.dirname(found),
    'node_modules',
    ...PACKAGE_NAME.split('/'),
    'bin',
    BIN_NAME
  );
  return (
    fs.existsSync(target) && realpath(target).toLowerCase() === realpath(scriptPath).toLowerCase()
  );
}

export function chooseCommand({ env, platform, scriptPath, nodePath }) {
  if (platform !== 'win32') return { command: `"${nodePath}" "${scriptPath}"` };
  const found = findOnPath(BIN_NAME, env, platform);
  if (found && isOurWindowsShim(found, scriptPath)) return { command: BIN_NAME };
  if (/\s/.test(scriptPath)) {
    return {
      error:
        `agy on Windows can't run a command whose path contains spaces:\n  ${scriptPath}\n` +
        `Install from npm instead:  npm i -g ${PACKAGE_NAME}  then run  agy-statusline install`,
    };
  }
  return { command: `node ${scriptPath}` };
}

export function install({ home, env, platform, configDir, scriptPath, nodePath, out, err }) {
  const choice = chooseCommand({ env, platform, scriptPath, nodePath });
  if (choice.error) {
    err(choice.error);
    return 1;
  }
  const statusLine = { type: 'command', command: choice.command, enabled: true };
  const settingsPath = agySettingsPath(home);
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      err(
        `Could not parse ${settingsPath} (${e.message}).\n` +
          `Fix it, or add this yourself:\n  "statusLine": ${JSON.stringify(statusLine)}`
      );
      return 1;
    }
  } else {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  }

  fs.mkdirSync(configDir, { recursive: true });
  if (!isOurs(settings.statusLine) && !fs.existsSync(statePath(configDir))) {
    atomicWriteSync(
      statePath(configDir),
      JSON.stringify({ statusLine: settings.statusLine ?? null }, null, 2) + '\n'
    );
  }
  settings.statusLine = statusLine;
  atomicWriteSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');

  const configPath = path.join(configDir, 'config.mjs');
  if (!fs.existsSync(configPath)) atomicWriteSync(configPath, defaultConfigSource());

  out(
    `✓ agy status line → ${choice.command}\n` +
      `  agy settings: ${settingsPath}\n  your config:  ${configPath}\n` +
      `Restart agy to see it. Try: agy-statusline themes`
  );
  return 0;
}

export function uninstall({ home, configDir, out, err }) {
  const settingsPath = agySettingsPath(home);
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch {
    err(`Can't read ${settingsPath}; nothing changed.`);
    return 1;
  }
  if (!isOurs(settings.statusLine)) {
    out('agy-statusline is not the active status line; nothing changed.');
    return 0;
  }
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(statePath(configDir), 'utf8')).statusLine ?? null;
  } catch {}
  if (previous) settings.statusLine = previous;
  else delete settings.statusLine;
  atomicWriteSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  fs.rmSync(statePath(configDir), { force: true });
  out(
    `✓ Restored agy's previous status line (your config in ${configDir} was kept). Restart agy to apply.`
  );
  return 0;
}
