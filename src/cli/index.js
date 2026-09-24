import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';
import { install, uninstall } from './install.js';
import { setTheme, printThemes, preview } from './theme.js';
import { getConfigDir } from '../core/utils.js';

function defaultIo() {
  return {
    out: (s) => process.stdout.write(s + '\n'),
    err: (s) => process.stderr.write(s + '\n'),
    home: os.homedir(),
    env: process.env,
    platform: process.platform,
    configDir: getConfigDir(),
    scriptPath: url.fileURLToPath(new URL('../../bin/agy-statusline', import.meta.url)),
    nodePath: process.execPath,
    columns: process.stdout.columns || 100,
  };
}

function version() {
  return JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'))
    .version;
}

function help(io) {
  return `agy-statusline ${version()}: a programmable status line for the Antigravity CLI (agy)

Usage:
  agy-statusline install          Make agy use agy-statusline (remembers the previous status line)
  agy-statusline uninstall        Restore agy's previous status line
  agy-statusline theme <name>     Switch theme
  agy-statusline themes           List themes
  agy-statusline preview [name]   Show themes rendered with sample data
  agy-statusline --version

agy runs it with session JSON on stdin. Your config: ${path.join(io.configDir, 'config.mjs')}`;
}

export async function runCli(args, io = defaultIo()) {
  const [cmd, arg] = args;
  switch (cmd) {
    case 'install':
    case '--setup':
      return install(io);
    case 'uninstall':
      return uninstall(io);
    case 'theme':
    case '--load-theme':
      return setTheme(arg, io);
    case 'themes':
    case '--list-themes':
      return printThemes(io);
    case 'preview':
      return preview(arg, io);
    case '-v':
    case '--version':
      io.out(version());
      return 0;
    case undefined:
    case 'help':
    case '-h':
    case '--help':
      io.out(help(io));
      return 0;
    case '--save-theme':
    case '--delete-theme':
      io.err(
        `${cmd} was removed: themes are picked by name now (agy-statusline theme <name>). ` +
          `To customize, edit ${path.join(io.configDir, 'config.mjs')}.`
      );
      return 1;
    default:
      io.err(`Unknown command: ${cmd}\n\n${help(io)}`);
      return 1;
  }
}
