import fs from 'node:fs';
import path from 'node:path';
import colors from '../../core/colors.js';

export function getBranchNative(startDir) {
  try {
    let dir = startDir;
    let headPath = null;
    
    // Traverse upwards to find .git folder
    while (dir !== path.parse(dir).root) {
      const p = path.join(dir, '.git', 'HEAD');
      if (fs.existsSync(p)) {
        headPath = p;
        break;
      }
      dir = path.dirname(dir);
    }
    
    if (!headPath) return null;
    
    const head = fs.readFileSync(headPath, 'utf8').trim();
    if (head.startsWith('ref: ')) {
      return head.split('/').pop();
    }
    return head.slice(0, 7); // Detached head
  } catch (err) {
    return null;
  }
}

export function renderCwd(payload, utils = {}) {
  const cwd = payload?.workspace?.current_dir || payload?.cwd || process.cwd();
  const homeDir = utils.homeDir || process.env.HOME || process.env.USERPROFILE;
  
  let baseName = path.basename(cwd);
  if (cwd === homeDir) {
    baseName = '~';
  }
  return colors.cyan(baseName);
}

export function renderBranch(payload, utils = {}) {
  const cwd = payload?.workspace?.current_dir || payload?.cwd || process.cwd();
  const getBranch = utils.getBranch || getBranchNative;
  const branch = getBranch(cwd);
  
  if (branch) {
    return colors.green(branch);
  }
  return '';
}

export function renderCwdBranch(payload, utils = {}) {
  const c = renderCwd(payload, utils);
  const b = renderBranch(payload, utils);
  if (b) {
    return `${c}${colors.dim('@')}${b}`;
  }
  return c;
}
