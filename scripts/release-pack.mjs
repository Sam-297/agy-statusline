// Packs the release asset as ./agy-statusline.tgz. The name must stay fixed: users install with
//   npm i -g https://github.com/Sam-297/agy-statusline/releases/latest/download/agy-statusline.tgz
// and GitHub only resolves releases/latest/download/<name> if every release uses the same name.
// `npm pack` runs prepack/postpack, so the tarball includes the one-file render bundle.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import url from 'node:url';

const root = url.fileURLToPath(new URL('..', import.meta.url));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agy-release-'));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const [info] = JSON.parse(
  execFileSync(npm, ['pack', '--json', '--pack-destination', tmp], {
    cwd: root,
    encoding: 'utf8',
    shell: process.platform === 'win32',
  })
);
const out = path.join(root, 'agy-statusline.tgz');
fs.copyFileSync(path.join(tmp, info.filename), out);
fs.rmSync(tmp, { recursive: true, force: true });
if (!info.files.some((f) => f.path === 'src/core/run.bundle.js')) {
  throw new Error('release tarball is missing src/core/run.bundle.js');
}
console.log(`${out} (${info.name}@${info.version}, ${info.files.length} files)`);
