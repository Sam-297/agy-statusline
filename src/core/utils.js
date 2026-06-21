import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

export function getConfigDir() {
  const home = os.homedir() || process.env.HOME || process.env.USERPROFILE || '/';
  if (process.env.XDG_CONFIG_HOME && path.isAbsolute(process.env.XDG_CONFIG_HOME)) {
    return path.join(process.env.XDG_CONFIG_HOME, 'agy-statusline');
  }
  return path.join(home, '.config', 'agy-statusline');
}

export function getThemesDir() {
  return path.join(getConfigDir(), 'themes');
}

function syncSleep(ms) {
  const start = Date.now();
  while (Date.now() - start < ms) {}
}

export function atomicWriteSync(filePath, content) {
  const tmpPath = filePath + '.tmp.' + process.pid + '.' + Math.random().toString(36).slice(2);
  fs.writeFileSync(tmpPath, content, 'utf8');
  let retries = 5;
  while (retries > 0) {
    try {
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
        retries--;
        if (retries === 0) {
          try { fs.unlinkSync(tmpPath); } catch (e) {}
          throw err;
        }
        syncSleep(50);
      } else {
        try { fs.unlinkSync(tmpPath); } catch (e) {}
        throw err;
      }
    }
  }
}
