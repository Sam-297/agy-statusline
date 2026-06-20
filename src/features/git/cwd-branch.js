import fs from 'node:fs';
import path from 'node:path';
import colors from '../../core/colors.js';

export function getBranchNative(dir) {
  try {
    const headPath = path.join(dir, '.git', 'HEAD');
    if (!fs.existsSync(headPath)) return null;
    const head = fs.readFileSync(headPath, 'utf8').trim();
    if (head.startsWith('ref: ')) {
      return head.split('/').pop();
    }
    return head.slice(0, 7); // Detached head
  } catch (err) {
    return null;
  }
}

export function renderCwdBranch(payload, utils = {}) {
  const cwd = payload?.workspace?.current_dir || payload?.cwd || process.cwd();
  const getBranch = utils.getBranch || getBranchNative;
  const homeDir = utils.homeDir || process.env.HOME || process.env.USERPROFILE;
  
  let baseName = path.basename(cwd);
  if (cwd === homeDir) {
    baseName = '~';
  }
  
  const branch = getBranch(cwd);
  if (branch) {
    return `${colors.cyan(baseName)}${colors.dim('@')}${colors.green(branch)}`;
  }
  return colors.cyan(baseName);
}
