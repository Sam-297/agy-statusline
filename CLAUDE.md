# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`agy-statusline` (package `@sam-297/agy-statusline`, bin `agy-statusline`; shipped as GitHub Release tarballs, not on the npm registry) is a status line for the Antigravity CLI (`agy`). agy runs it on every refresh, pipes session JSON to stdin, and shows whatever it prints (ANSI colors and multiple lines are fine). **Zero runtime npm dependencies**: only `node:` built-ins. ESM, Node >=20. CI runs Node 20/22 on ubuntu, macOS and Windows, plus a Windows job that runs through the npm shim exactly as agy does.

**Read [docs/agy-contract.md](docs/agy-contract.md) before changing anything about invocation, install, or payload handling.** It records how agy actually behaves, measured on real agy on Linux and native Windows. [docs/audit.md](docs/audit.md) has the findings and decisions behind the 2.0 rebuild.

## Commands

```bash
npm test                                                   # node --test, all tests/**/*.test.js
node --test tests/core/renderer.test.js                    # one file
node --test --test-name-pattern="timeout" tests/core/renderer.test.js   # one test
npm run lint                                               # eslint (0 errors required; CI enforces it)
npx prettier --write <files>                               # single quotes, semicolons, width 100
node bin/agy-statusline preview [theme]                    # render themes with SAMPLE_PAYLOAD
node bin/agy-statusline < tests/fixtures/payloads/linux-git-active.json   # render with your real config
npm run screenshots                                        # regenerate docs/theme_*.png (puppeteer)
npm run build                                              # build the render bundle (normally only via npm pack); --clean removes it
npm run release:pack                                       # ./agy-statusline.tgz, the asset to attach to a GitHub Release
```

Tests are hermetic: they use temp `XDG_CONFIG_HOME` / `HOME`. Keep it that way; never touch the real `~/.config/agy-statusline` or `~/.gemini` in tests. Payload fixtures in `tests/fixtures/payloads/` are anonymized captures from real agy; `tests/helpers.js` loads them.

## Hard rules (from observed agy behavior)

- **Render mode always exits 0 and finishes well under 4 s.** Any non-zero exit or timeout makes agy print a `⚠ Statusline Error` block into the user's chat. `src/core/run.js` enforces a 3 s hard deadline; each segment gets 300 ms (`SEGMENT_TIMEOUT_MS`).
- **Windows agy splits the command on whitespace and keeps quotes literally.** `install` registers `node <path>` when the path has no spaces (fastest), else the bare `agy-statusline` npm shim. Never quote. Linux runs it via `sh -c`, so quoted absolute paths are fine there. See `chooseCommand` in `src/cli/install.js`.
- **agy sends no git branch** (only `vcs.type`), so `data.readGitBranch` reads `.git/HEAD` from disk (worktrees supported, no `git` spawn).
- stdout is a pipe, not a TTY, and agy sets no `COLUMNS`: use `payload.terminal_width`.
- Don't show `email` / `session_id` by default.

## Architecture

`bin/agy-statusline`: piped stdin with no args goes to render mode; anything else goes to the CLI (`src/cli/index.js`). Render mode imports `src/core/run.bundle.js` if present, else `src/core/run.js`. The bundle is a one-file esbuild build of the render path (`scripts/build.mjs`). It only exists inside published packages (created on `prepack`, deleted on `postpack`), because each ESM file costs ~3.5 ms to load on Windows. `tests/integration/bundle.test.js` checks bundle output equals source output.

Render pipeline: `readStdin` → `parsePayload` → `loadConfig` → `renderStatusLine` → stdout (CRLF on Windows).

- **`src/core/data.js`**: the only place that knows the payload shape (`getModel`, `getContext`, `getQuota`, `getBranch`, …). Quota is always shown as _used_ %.
- **`src/core/segments.js`**: built-in segments `{ priority, render(payload) }` (higher priority = kept longer when narrow), `ALIASES` for 1.x names, and top-level payload keys or dotted paths as segments.
- **`src/core/renderer.js`**: runs all segments concurrently with timeouts. A throw or timeout shows as `[name: …]` inline. Config warnings become a trailing `⚠` segment. It drops the lowest priority until the line fits `terminal_width - 2`, then truncates. A `'\n'` separator means multi-line: truncate lines, don't drop. `NO_COLOR` strips all ANSI. Custom segments receive `utils` (`makeUtils`): colors, format, data, displayWidth, truncate, width.
- **`src/core/width.js`**: terminal column width (emoji/CJK = 2, combining = 0) with a hand-rolled grapheme clusterer. Deliberately not `Intl.Segmenter`, which costs ~10 ms per process. Similarly `format.js` avoids `Intl.DateTimeFormat`. Startup cost matters because agy spawns a process per refresh (render ≈ bare node + 20 ms).
- **`src/core/config.js`**: `config.mjs` is `{ theme, ...overrides }`. The theme is loaded by name from `themes/`, and user keys override it. Old configs with copied theme code (`{ separator, segments }`) still work. Mistakes become `warnings`, never silent fallbacks.
- **`themes/*.js`**: `export default { separator, segments }`, using only built-in names and the `utils` argument (no imports), so users can copy one into their config.
- **`src/cli/`**: `install`/`uninstall` (writes agy's `settings.json`, saves the previous `statusLine` in `<configDir>/previous-statusline.json`), and `theme`/`themes`/`preview`.

Adding a built-in segment: add it to `SEGMENTS` with a priority, read the payload through `data.js`, and add a row to the table in `themes/README.md`. `tests/core/segments.test.js` renders every built-in against every fixture.

## Gotchas

- When writing files through tools, `\uXXXX` escapes in tool input may be decoded into literal (possibly invisible) characters. Check with `grep -P '[^\x00-\x7F]'`, and write escapes via a placeholder + `sed` if needed.
- `scripts/capture-payload.mjs` records real agy payloads (point agy's `statusLine` at it; output goes to the gitignored `scripts/captures/`). Use it to refresh fixtures and the contract doc after agy updates, since agy updates itself silently.

## Releasing

1. Bump `version` in `package.json` and add a `CHANGELOG.md` entry.
2. `npm run release:pack` creates `./agy-statusline.tgz` (bundle included; the script fails if it isn't).
3. `gh release create vX.Y.Z agy-statusline.tgz --notes-file <changelog section>`. The asset name must stay `agy-statusline.tgz`: the README's install URL is `releases/latest/download/agy-statusline.tgz`.
