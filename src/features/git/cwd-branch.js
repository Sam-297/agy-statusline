import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import colors from '../../core/colors.js';

const headPathCache = new Map();

export function getBranchNative(startDir) {
  try {
    let headPath = headPathCache.get(startDir);
    
    if (headPath === undefined) {
      let dir;
      try { dir = fs.realpathSync(startDir); } catch(e) { dir = startDir; }
      
      while (true) {
        const gitPath = path.join(dir, '.git');
        if (fs.existsSync(gitPath)) {
          const stats = fs.statSync(gitPath);
          if (stats.isFile()) {
            const gitFd = fs.openSync(gitPath, 'r');
            const buffer = Buffer.alloc(1000);
            const bytesRead = fs.readSync(gitFd, buffer, 0, 1000, 0);
            fs.closeSync(gitFd);
            
            const content = buffer.toString('utf8', 0, bytesRead).trim();
            if (content.startsWith('gitdir: ')) {
              const realGitDir = path.resolve(dir, content.replace('gitdir: ', ''));
              headPath = path.join(realGitDir, 'HEAD');
            }
          } else {
            headPath = path.join(gitPath, 'HEAD');
          }
          if (headPath && fs.existsSync(headPath)) break;
          headPath = null;
        }
        
        const parent = path.dirname(dir);
        if (parent === dir) break;
        dir = parent;
      }
      headPathCache.set(startDir, headPath || null);
      if (headPathCache.size > 100) headPathCache.delete(headPathCache.keys().next().value);
    }
    
    if (!headPath) return null;
    
    const headFd = fs.openSync(headPath, 'r');
    const buffer = Buffer.alloc(100);
    const bytesRead = fs.readSync(headFd, buffer, 0, 100, 0);
    fs.closeSync(headFd);
    
    const head = buffer.toString('utf8', 0, bytesRead).trim();
    if (head.startsWith('ref: ')) {
      return head.replace('ref: refs/heads/', '').replace('ref: ', '');
    }
    return head.length > 0 ? head.slice(0, 7) : null; // Detached head
  } catch (err) {
    return null;
  }
}

export function renderCwd(payload, utils = {}) {
  let cwd = payload?.workspace?.current_dir || payload?.cwd;
  if (typeof cwd !== 'string') {
    try { cwd = process.cwd(); } catch(e) { cwd = '/'; }
  }
  
  // Use os.homedir() instead of process.env to guarantee format matches process.cwd() on Windows Git Bash
  let rawHome;
  try { rawHome = os.homedir(); } catch(e) { rawHome = null; }
  const homeDir = utils.homeDir || rawHome || process.env.HOME || process.env.USERPROFILE || '/';
  
  let baseName = path.basename(cwd);
  if (!baseName) baseName = cwd; // Fallback for root directories like '/' or 'C:\'
  
  const normalize = p => p.replace(/^[a-zA-Z]:/, '').replace(/^\/[a-zA-Z]\//, '/').replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
  if (normalize(cwd) === normalize(homeDir)) {
    baseName = '~';
  }
  return colors.cyan(baseName);
}

export function renderBranch(payload, utils = {}) {
  let cwd = payload?.workspace?.current_dir || payload?.cwd;
  if (typeof cwd !== 'string') {
    try { cwd = process.cwd(); } catch(e) { cwd = '/'; }
  }
  const getBranch = utils.getBranch || getBranchNative;
  const branch = getBranch(cwd);
  
  if (branch) {
    return colors.green(branch);
  }
  return '';
}

export function renderCwdBranch(payload, utils = {}) {
  const cwdStr = renderCwd(payload, utils);
  const branchStr = renderBranch(payload, utils);
  if (branchStr) {
    return `${cwdStr}${colors.dim('@')}${branchStr}`;
  }
  return cwdStr;
}
