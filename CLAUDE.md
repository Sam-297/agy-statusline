# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`agy-statusline` is a status line plugin for the Antigravity CLI (`agy`). The host CLI pipes a JSON payload to it on stdin, and it writes a single rendered (ANSI-colored, possibly multi-line) string to stdout. It must not have **any runtime npm dependencies**: it uses only `node:` built-ins, it is ESM (`"type": "module"`), and it needs Node >=18. CI runs on Node 20/22 across ubuntu, macOS and Windows.

## Commands

```bash
npm test                                   # node --test (runs all tests/**/*.test.js)
node --test tests/core/renderer.test.js    # single test file
node --test --test-name-pattern="custom" tests/core/renderer.test.js   # single test by name
npx eslint .                               # lint (flat config in eslint.config.mjs)
npx prettier --write <file>                # format: single quotes, semicolons, printWidth 100
node scripts/preview-all.js                # print every built-in theme against a mock payload
node bin/agy-statusline < dummy.json       # render with your real ~/.config/agy-statusline/config.mjs
```

CI only runs `npm test`, not lint. ESLint currently reports existing errors and warnings.

`tests/integration/cli.test.js` runs `--setup`, which creates `~/.config/agy-statusline/config.mjs` (or `$XDG_CONFIG_HOME/agy-statusline/`) if it is missing. Tests are not sandboxed from the real user config.

## Architecture

**Runtime flow** ([bin/agy-statusline](bin/agy-statusline)): parse argv. Theme commands (`--list-themes`, `--save-theme`, `--load-theme`, `--delete-theme`) and `--setup` exit early. Otherwise it reads stdin, with a 1.5s timeout and a 64MB cap. Then `parsePayload`, then `loadConfig(~/.config/agy-statusline/config.mjs)`, then `renderStatusLine(payload, config)`, then stdout. On Windows it converts `\n` to `\r\n`. Failures are silent and exit 0 so the host's UI never breaks.

The host invokes the plugin through `hooks/status-line.{sh,cmd,ps1}`. These wrappers resolve the plugin dir, clear `NODE_OPTIONS`, and exec the bin. `--setup` ([src/core/setup.js](src/core/setup.js)) prints the `statusLine` JSON snippet that users paste into `~/.gemini/antigravity-cli/settings.json`.

**Config is executable JS.** `loadConfig` dynamically `import()`s the user's `config.mjs` and shallow-merges its default export over `DEFAULTS` ([src/core/config.js](src/core/config.js)). An exported array is treated as `{ segments }`. On an import error it prints to stderr and falls back to the defaults.

**Segments** ([src/core/renderer.js](src/core/renderer.js)): each entry in `config.segments` is one of three kinds:
1. A built-in name that is a key in `SEGMENT_MAP`. Most delegate to `src/features/<area>/*.js` renderers of the form `(payload, utils) => string`. The small ones are inlined in the map.
2. A function `(payload, utils) => string | Promise<string>`. `utils` is `{ colors, formatNumber }`. A thrown error renders as a red `[Error: …]` instead of crashing.
3. Any other string, treated as a dotted payload path (e.g. `"context_window.used_percentage"`) with proto-pollution keys blocked.

Empty results are dropped. Every segment gets `\x1b[0m` appended to stop color bleed. Width fitting: the renderer measures visible width (ANSI stripped, code points counted, max line for multi-line segments) against `payload.terminal_width - 2`. It drops segments in `HIDE_PRIORITY` order first, then from the end. `terminal_width: 0` means unlimited.

**Adding a built-in segment**: add a renderer under `src/features/`, register it in `SEGMENT_MAP`, and consider adding it to `HIDE_PRIORITY`. Also add it to the "Available Built-in Segments" list in [themes/README.md](themes/README.md).

**Themes** ([themes/](themes/)): built-in themes are plain `export default { separator, segments }` `.js` files, and several are entirely one big custom-function segment (e.g. `dashboard.js`). `--load-theme` copies the file's text into the user's `config.mjs`, so **themes must be self-contained and must not import from `src/`**. They can only use the `utils` argument. User-saved themes live in `~/.config/agy-statusline/themes/*.mjs` and take precedence over built-ins with the same name. Theme names must match `^[a-z0-9-]+$`. Config writes go through `atomicWriteSync` ([src/core/utils.js](src/core/utils.js)), which retries the rename on EBUSY/EPERM for Windows.

**Colors** ([src/core/colors.js](src/core/colors.js)): 24-bit truecolor wrappers that respect `NO_COLOR`. Use `colors.stripAnsi` for width math.

**Git branch** ([src/features/git/cwd-branch.js](src/features/git/cwd-branch.js)): it reads `.git/HEAD` directly, walking up directories and following `gitdir:` files for worktrees and submodules. It never shells out to `git`. Results are cached per start dir.

## Payload

The real payload shape as captured from agy is documented in `payload_verification.md` (gitignored, local only). Key fields are `model.display_name`, `version`, `git.{branch,cwd}`/`workspace.*`, `context_window.{total_input_tokens,total_output_tokens,context_window_size,used_percentage}`, `quota.{gemini-5h,gemini-weekly,3p-5h,3p-weekly}.{remaining_fraction,reset_time,reset_in_seconds}`, `terminal_width`, `agent_state`, `plan_tier`, `email`, `session_id`, `sandbox.enabled`, `tool_confirmation_pending` and `exceeds_200k_tokens`. `dummy.json` is a sample payload.

## Screenshots

The `docs/theme_*.png` images are generated by `screenshot.js` (gitignored). It uses puppeteer and ansi-to-html, which are in `node_modules` but not in `package.json`. **It overwrites and then deletes `~/.config/agy-statusline/config.mjs`**, and it contains a hardcoded absolute repo path. Regenerate the screenshots whenever a theme's output changes.
