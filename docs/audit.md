# agy-statusline audit (2026-09-24)

Audited against the real agy behavior in [agy-contract.md](agy-contract.md) (agy 1.2.10, Linux + native Windows), not against assumptions. Severity: **S1** = broken for users, **S2** = wrong or misleading output, **S3** = quality/maintenance.

## Is the idea right?

**Yes. Keep the product, rebuild the foundation.**

- agy's built-in status line shows only `? for shortcuts … Gemini 3.1 Pro · high`: no quota, context usage, branch or reset times. A custom status line fills a real gap. Quota with reset times is the most valuable thing we show; agy shows it nowhere by default.
- The competitor **agy-hud** (npm) has a fixed layout with JSON toggles, a quota cache, an update checker and i18n. Our real differentiator is **programmability**: segments, layouts and themes, like Starship compared with a fixed prompt. That's worth keeping, but only if it works everywhere and the themes are good. Today neither is true.
- What's wrong is the execution: install/setup, Windows support, the theme model, and data that has drifted from agy.

## Findings

| # | Sev | Area | Finding | Evidence | Fix direction |
|---|---|---|---|---|---|
| 1 | S1 | Windows | Registering a path with a space (any `C:\Users\First Last\…`) cannot work: agy on Windows passes quotes through literally | contract doc, probe | Register a bare command resolved on PATH (npm global shim) |
| 2 | S1 | Windows | `hooks/status-line.ps1` is blocked by the default PowerShell execution policy | `npm.ps1 cannot be loaded` | Delete it; never ship `.ps1` entry points |
| 3 | S1 | Setup | `--setup` prints `"type": "custom"`; agy uses `"command"`. The user must also hand-edit JSON | `setup.js:31`, real settings.json | `install` writes settings.json itself (with a backup); `uninstall` restores it |
| 4 | S1 | Install | `agy plugin install` does nothing for the status line: `hooks.json` isn't a status line hook, and it points at a nonexistent file | contract doc | Drop `hooks.json`, `plugin.json`, `hooks/` and the plugin-install step |
| 5 | S1 | Robustness | One slow or hanging segment blanks the **whole** line: the 1.5 s stdin timer keeps running during render and exits with no output | hanging segment → exit 0, empty, 1564 ms | Per-segment deadline (~300 ms); overall deadline well under agy's 4–5 s; render what finished |
| 6 | S1 | Robustness | Any non-zero exit prints `⚠ Statusline Error` into the user's chat; the code exits 1 on some paths (stdin > 64 MB, unknown flags when piped) | probe, `bin/agy-statusline` | Render mode always exits 0 |
| 7 | S1 | Windows | When killed on timeout, Node processes started through a `.cmd` shim keep running as orphans | probe: 9 s sleeper ran to completion | Own hard deadline (`setTimeout(..).unref()` + `process.exit(0)`) |
| 8 | S2 | Data | agy sends no `git` object (only `vcs.type`); `dashboard`, `cyberpunk`, `elegant` read `git.branch`, so the branch is never shown (cyberpunk shows a fake `MAIN`) | fixtures | One branch source (fs HEAD read, which already exists); themes use it |
| 9 | S2 | Data | `artifact_count` and `tool_confirmation_pending` are no longer sent; segments and themes built on them are dead (`Arts:0`, `⚡CONFIRM`) | fixtures | Remove them |
| 10 | S2 | Themes | Fake placeholders at startup (`model: null`): `SYS_CORE`, `Unknown`, `v1.0.0`, `[free]`, `0/1`, `NET:OK` | render-all against `linux-startup` | Omit missing data; never invent it |
| 11 | S2 | Themes | `dashboard` renders **nothing** at 80 columns (the whole segment is dropped) | render-all @80 | Responsive layout: shed lines/fields instead of dropping everything |
| 12 | S2 | Privacy | `dashboard` shows the full email and session UUID by default; screenshots risk leaking them | render-all | PII only through opt-in segments; masked by default |
| 13 | S2 | Consistency | The same quota shows as `0%` (used, default theme) and `100%` (remaining, elegant/dashboard) | render-all | One convention everywhere (used %, plus reset time) |
| 14 | S2 | Data | Token % is `(input+output)/size`, while agy's `used_percentage` is `input/size`, so we disagree with agy | fixture: 8.55% vs ours | Use `used_percentage` when present |
| 15 | S2 | Rendering | Width counts code points, but emoji and CJK take 2 columns, so lines overflow and wrap. The WIP dashboard swapped to ASCII to dodge this | `renderer.js:94` | A real `displayWidth()` |
| 16 | S2 | Config UX | Mistakes are silent: typo'd segment names vanish, `segments: 'model'` quietly becomes `['cwd_branch']`, `separator: undefined` joins with `,`, and syntax errors fall back to defaults with the message on stderr, which agy discards | robustness run | Validate the config; show a short inline `⚠ config: …` hint in the line itself |
| 17 | S2 | Themes | Themes are **copied** into the user's config (`--load-theme`), so fixes and new features never reach anyone who loaded a theme | `theme-manager.js` | Reference themes by name; they live in the package |
| 18 | S3 | Themes | Bar/color/quota logic is copy-pasted across 4–5 themes; cyberpunk/retro use raw ANSI and ignore `NO_COLOR` | themes/*.js | Shared helpers passed via `utils` |
| 19 | S3 | Segments | `session_id` and `session_id_short` both always print `ID:s***` | `renderer.js` | Remove, or show the real short id |
| 20 | S3 | Perf | ~74 ms/render on Linux (Node alone: 27), ~133 ms on Windows (Node alone: ~102). Every feature module is imported eagerly; the in-process git cache can never hit (new process per render) | contract doc | Lazy-load only the segments in use; Node compile cache; delete the dead cache |
| 21 | S3 | Code | `atomicWriteSync` busy-waits the CPU; the 64 MB payload cap is 40,000× the real 1.6 KB | `utils.js`, `parser.js` | Simplify |
| 22 | S3 | Tooling | ESLint config is broken (`globals: { node: true }` isn't how flat config works, so `Buffer`/`URL` are "undefined"); lint isn't in CI; `lint-staged` has no runner; puppeteer/ansi-to-html are undeclared; the screenshot script clobbers the real config and hardcodes `/home/sam/…` | `npx eslint .` | Fix the config and add lint to CI; declare dev deps; hermetic screenshot script |
| 23 | S3 | Tests | 31 tests / ~45 asserts. None cover themes, width fitting, theme commands, Windows paths or real payloads; several only check that a function exists | test inventory | Fixture-driven tests: every theme × every fixture × widths 40/80/160 |
| 24 | S3 | Repo | 14 MB `freeze` binary, tarball, `.ans` files, `dummy.json`, stale planning docs (`progress.md`, `build_plan.md`, `ARCHITECTURE.md` about Gemini agents) | `ls` | Delete |

## What's fine and stays

- The segment model (a name, a function, or a payload path) and priority-based dropping to fit the width. Proven working in real agy.
- Reading git HEAD straight from disk (fast, no `git` spawn). It's needed, because agy doesn't send the branch.
- Zero runtime dependencies, Node ESM, `node:test`, and the CI matrix across 3 OSes.
- Multi-line layouts: agy renders them fine.

## Decisions (Phase 3, 2026-09-24)

1. **Distribution: npm, and the same installer works from a git clone.** The user said "idk", so Claude chose this. The npm name `agy-statusline` is **taken** (by pkradioman, May 2026), so the package is **`@sam-297/agy-statusline`** and the command stays `agy-statusline`. `agy-statusline install` registers the bare command when our npm shim is on PATH (the only form that works on every Windows variant). Otherwise it registers `"<node>" "<script>"` on Linux/macOS, or `node <script>` on Windows if the path has no spaces. `agy-statusline uninstall` restores the previous `statusLine`. The `agy plugin install` flow, `hooks/`, `hooks.json` and `plugin.json` are dropped. Publishing to npm needs the user's npm login and is done last, with their go-ahead.
2. **Config & themes: theme by name** (user's choice). `config.mjs` is `export default { theme: 'dashboard' }` plus optional overrides. Themes live in the package. Custom function segments still work. `agy-statusline theme <name>`, `themes` and `preview` replace save/load/delete-theme (`--setup`, `--load-theme` and `--list-themes` stay as aliases).
3. **Theme lineup: keep all 6, fixed** (user's choice). They get shared helpers, real data only, responsive layouts, and no PII by default.
4. **Latency target:** Linux ≤ 45 ms, Windows ≤ 120 ms per render.
5. **Node floor raised to 20.** 18 is end-of-life, and the tests already use `import.meta.dirname` (20.11+).
6. **Execution:** the user chose plan-only for now. Plan: `docs/superpowers/plans/2026-09-24-foundation-rebuild.md`.

## Resolution (2.0.0, branch `audit-and-fix`)

Each finding was verified fixed in real agy 1.2.10 on WSL and native Windows (Task 13 of the rebuild plan), except where noted.

| # | Fixed by | How |
|---|---|---|
| 1 | 5a6d0f5, f048037, 0ef2d1b | `install` registers `node <plain path>` or the bare npm shim, never a quoted path. Verified from `C:\Users\samha\space test` |
| 2 | 0352363 | `.ps1`/`.sh`/`.cmd` hooks deleted |
| 3 | 5a6d0f5, 45880de | `install` writes `settings.json` itself (`type: "command"`); `uninstall` restores the exact previous value |
| 4 | 0352363 | `hooks.json`, `plugin.json`, `hooks/` removed; README uses npm |
| 5 | daacd03, 0352363 | 300 ms per-segment timeout (`[name: timeout]` inline); 3 s hard deadline |
| 6 | 0352363 | Render mode always exits 0; errors render inline. 0 `Statusline Error` in live tests |
| 7 | 0352363 | Own 3 s deadline, well below agy's ~4–5 s kill |
| 8 | 1b15f8c, abc4cfa | `data.getBranch` reads `.git/HEAD` for every theme |
| 9 | 1180a9f, abc4cfa | Dead fields removed from segments and themes |
| 10 | abc4cfa | Themes omit missing data; tests reject placeholders |
| 11 | daacd03, abc4cfa | Multi-line lines are truncated, not dropped; regression test at 80 columns |
| 12 | 1180a9f, abc4cfa | PII only via opt-in segments; tests reject it in every theme |
| 13 | 1b15f8c | Quota is "used %" everywhere |
| 14 | 1b15f8c | Context uses agy's `used_percentage` |
| 15 | 62cb822, f048037 | `displayWidth`/`truncate` count emoji, CJK, ZWJ, flags and skin tones |
| 16 | 6ebfd3a | Config mistakes become a visible `⚠` segment |
| 17 | 6ebfd3a, 1652fb2 | Themes selected by name from the package; 1x flags kept as aliases |
| 18 | abc4cfa, daacd03 | Shared `utils` helpers; the renderer applies `NO_COLOR` globally |
| 19 | 1180a9f | `session_id_short` shows the real short id |
| 20 | 0352363, 6e9bec3, f048037 | Linux ~40–45 ms, Windows ~118 ms (see agy-contract.md → Performance) |
| 21 | 2d25089, 0352363 | `Atomics.wait` instead of a busy loop; 1 MB payload cap |
| 22 | 2d25089, 540bcff | Lint fixed and in CI; dev deps declared; hermetic screenshot script |
| 23 | all feature commits | 31 → 172 tests: fixtures × themes × widths, CLI, install, bundle equivalence |
| 24 | 2d25089, 540bcff | Stale files moved to `~/agy-statusline-old-local-files/` or deleted |

Also found and fixed during the rebuild: the CLI ignored `XDG_CONFIG_HOME` (3fa9532); `theme` overwrote earlier config backups (1445850); install/uninstall mistook other tools named `agy-statusline` for itself (45880de); and the install path could be interpreted by `sh` (0ef2d1b).
