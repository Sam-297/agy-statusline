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

function syncSleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

export function atomicWriteSync(target, content) {
  // Write through symlinks (dotfile managers) and keep the existing permissions.
  let filePath = target;
  let mode;
  try {
    filePath = fs.realpathSync(target);
    mode = fs.statSync(filePath).mode & 0o777;
  } catch {}
  const tmpPath = filePath + '.tmp.' + process.pid + '.' + Math.random().toString(36).slice(2);
  fs.writeFileSync(tmpPath, content, { encoding: 'utf8', mode });
  if (mode !== undefined) fs.chmodSync(tmpPath, mode); // writeFileSync's mode is masked by umask
  let retries = 5;
  while (retries > 0) {
    try {
      fs.renameSync(tmpPath, filePath);
      return;
    } catch (err) {
      if (err.code === 'EBUSY' || err.code === 'EPERM' || err.code === 'EACCES') {
        retries--;
        if (retries === 0) {
          try {
            fs.unlinkSync(tmpPath);
          } catch (e) {}
          throw err;
        }
        syncSleep(50);
      } else {
        try {
          fs.unlinkSync(tmpPath);
        } catch (e) {}
        throw err;
      }
    }
  }
}
