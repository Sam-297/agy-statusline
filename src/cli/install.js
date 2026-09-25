// Registers agy-statusline as agy's status line command. Rules: docs/agy-contract.md
// (Windows agy splits the command on spaces and keeps quotes literally).
import fs from 'node:fs';
import path from 'node:path';
import { atomicWriteSync } from '../core/utils.js';
import { defaultConfigSource } from '../core/config.js';

export const PACKAGE_NAME = '@sam-297/agy-statusline';
export const BIN_NAME = 'agy-statusline';
// Not on the npm registry: releases are GitHub Release tarballs (the latest one always has this URL).
export const INSTALL_URL =
  'https://github.com/Sam-297/agy-statusline/releases/latest/download/agy-statusline.tgz';

export const agySettingsPath = (home) =>
  path.join(home, '.gemini', 'antigravity-cli', 'settings.json');
// Remembers the statusLine that was there before us and the exact command we registered,
// so we never mistake another tool (e.g. a different package also named agy-statusline) for us.
const statePath = (configDir) => path.join(configDir, 'previous-statusline.json');
const V1_HOOK = /agy-statusline[\\/]+hooks[\\/]+status-line/;

function readState(configDir) {
  try {
    return JSON.parse(fs.readFileSync(statePath(configDir), 'utf8'));
  } catch {
    return null;
  }
}

// Ours = what we registered last time, what we would register now (covers a lost state
// file), or the 1.x hook.
function isOurs(statusLine, knownCommands) {
  const command = statusLine?.command;
  if (typeof command !== 'string') return false;
  return knownCommands.includes(command) || V1_HOOK.test(command);
}

function readSettings(settingsPath) {
  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    return { error: `Could not parse ${settingsPath} (${e.message}).` };
  }
  if (typeof settings !== 'object' || settings === null || Array.isArray(settings)) {
    return { error: `${settingsPath} must contain a JSON object; leaving it alone.` };
  }
  return { settings };
}

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

// agy runs the command with `sh -c` on Linux/macOS. Single quotes stop sh from expanding
// $(...), backticks and variables that could be in an install path.
const shQuote = (s) => `'${s.replaceAll("'", `'\\''`)}'`;
// Windows agy splits on whitespace with no quoting, and may run through sh or cmd, so only
// plain path characters may appear in a command we register there.
const PLAIN_WINDOWS_PATH = /^[A-Za-z0-9_.:\\/@~+-]+$/;

export function chooseCommand({ env, platform, scriptPath, nodePath }) {
  if (platform !== 'win32') return { command: `${shQuote(nodePath)} ${shQuote(scriptPath)}` };
  // Fastest: node directly (npm's .cmd shim adds ~20 ms per render). Forward slashes: Node
  // accepts them, and agy may run the command through Git Bash's sh, where \ is an escape.
  if (PLAIN_WINDOWS_PATH.test(scriptPath)) {
    return { command: `node ${scriptPath.replaceAll('\\', '/')}` };
  }
  const found = findOnPath(BIN_NAME, env, platform);
  if (found && isOurWindowsShim(found, scriptPath)) return { command: BIN_NAME };
  return {
    error:
      `agy on Windows can't safely run a command whose path has spaces or special characters:\n  ${scriptPath}\n` +
      `Install the release instead:  npm i -g ${INSTALL_URL}  then run  agy-statusline install`,
  };
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
    const read = readSettings(settingsPath);
    if (read.error) {
      err(
        `${read.error}\nFix it, or add this yourself:\n  "statusLine": ${JSON.stringify(statusLine)}`
      );
      return 1;
    }
    settings = read.settings;
  } else {
    fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  }

  fs.mkdirSync(configDir, { recursive: true });
  const state = readState(configDir);
  const previous = isOurs(settings.statusLine, [state?.registered, choice.command])
    ? (state?.statusLine ?? null)
    : (settings.statusLine ?? null);
  atomicWriteSync(
    statePath(configDir),
    JSON.stringify({ statusLine: previous, registered: choice.command }, null, 2) + '\n'
  );
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

export function uninstall({ home, env, platform, configDir, scriptPath, nodePath, out, err }) {
  const settingsPath = agySettingsPath(home);
  if (!fs.existsSync(settingsPath)) {
    err(`Can't read ${settingsPath}; nothing changed.`);
    return 1;
  }
  const read = readSettings(settingsPath);
  if (read.error) {
    err(`${read.error} Nothing changed.`);
    return 1;
  }
  const { settings } = read;
  const state = readState(configDir);
  const current = chooseCommand({ env, platform, scriptPath, nodePath }).command;
  if (!isOurs(settings.statusLine, [state?.registered, current])) {
    out('agy-statusline is not the active status line; nothing changed.');
    return 0;
  }
  const previous = state?.statusLine ?? null;
  if (previous) settings.statusLine = previous;
  else delete settings.statusLine;
  atomicWriteSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  fs.rmSync(statePath(configDir), { force: true });
  out(
    `✓ Restored agy's previous status line (your config in ${configDir} was kept). Restart agy to apply.`
  );
  return 0;
}
