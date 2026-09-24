# agy statusLine contract (observed)

How agy actually runs a `statusLine` command and what it sends. Everything here was **measured on 2026-09-24** against agy 1.2.3 → 1.2.10 on WSL2 Ubuntu and on native Windows 11 (PowerShell 5.1, no `sh` on PATH), by driving the real agy TUI in tmux. Payload fixtures: [`tests/fixtures/payloads/`](../tests/fixtures/payloads/). Tooling: [`scripts/capture-payload.mjs`](../scripts/capture-payload.mjs).

If you change behavior based on this doc, re-verify it first: agy updates itself silently (it went 1.2.3 → 1.2.10 during the session).

## Configuration

`~/.gemini/antigravity-cli/settings.json` (Windows: `%USERPROFILE%\.gemini\antigravity-cli\settings.json`):

```json
"statusLine": { "type": "command", "command": "<command string>", "enabled": true }
```

- `type` must be `"command"`. (`--setup` currently prints `"custom"`, which is wrong.)
- It can also be set live from inside agy with `/statusline <command>` (persists to settings.json). `/statusline delete` reverts to the built-in; `/statusline on|off` toggles it.
- `hooks.json` plays no part in the status line.

## Invocation

| | Linux | Windows (no `sh` on PATH) |
|---|---|---|
| How it runs | `sh -c "<command>"` | The command is **split on whitespace, with no quote handling**, and the first token is resolved on PATH |
| Quoted path with spaces | works | **broken.** Quotes reach the program literally (`Cannot find module 'C:\Users\x\"C:\Users\x\agy'`) |
| Bare command on PATH (e.g. a `.cmd` shim in `%APPDATA%\npm`) | works | **works, even if the shim's target path has spaces** |
| 8.3 short path | n/a | works, but 8.3 names can be disabled per volume |
| cwd | the agy workspace dir | the agy workspace dir |
| stdout | a pipe (`isTTY` false) | a pipe |
| env | inherited. agy does **not** set `NO_COLOR`, `COLUMNS` or `FORCE_COLOR` | inherited |

Windows with an `sh` on PATH (Git Bash etc.) likely goes through `sh -c` like Linux. The competitor agy-hud even installs an `sh.cmd` shim for this. This was not verified here. **Design rule:** the command we register must be a single bare token or an absolute path without spaces or quotes. That form works under every Windows variant.

## Timing & failure

- **Frequency:** event-driven, not polled. The command is called on startup, on agent state changes, during streaming, on terminal resize (usually 2 calls per resize), and while typing in the prompt. Calls come in bursts, with a median gap of ~300 ms and a minimum of 4 ms. There are no calls while idle.
- **Timeout:** between 4 s and 5 s. On Linux the process gets SIGKILL (no SIGTERM first). On Windows the direct child is killed, but **a grandchild `node` launched via a `.cmd` keeps running to completion (orphaned)**. We must enforce our own deadline well below 4 s and exit on our own.
- **What counts as a failure:** a non-zero exit, or the timeout. Output is discarded and agy prints a **visible `⚠ Statusline Error` block in the chat transcript**, with stderr included. It says "Statusline disabled after N consecutive failures", but 14 consecutive failures did not trigger it.
- **stderr on exit 0:** ignored and not shown. That's safe for diagnostics, but nobody will ever see it.
- **On timeout:** Linux blanks the status line. Windows showed the previous output.

**Design rule:** always exit 0 and render *something* (even an empty line) quickly. Never exit non-zero because of payload, config or render problems.

## Output

- Multi-line output is supported: every line is shown below the prompt.
- 24-bit ANSI color, emoji and CJK render correctly.
- There's no truncation or wrapping control from agy's side. Width is ours to manage using `terminal_width`.

## Payload

~1.6 KB of JSON on stdin, closed after writing. The same schema on Linux and Windows. Fields (all observed):

| Field | Type / example | Notes |
|---|---|---|
| `cwd` | `"/home/user/projects/demo"` | same as `workspace.current_dir` |
| `workspace.current_dir`, `workspace.project_dir` | string | |
| `session_id`, `conversation_id` | uuid, or `""` at startup | identical values |
| `transcript_path` | path to `transcript.jsonl` | |
| `model` | `null` at startup, then `{ id, display_name }` | e.g. `"Claude Opus 4.6 (Thinking)"` |
| `version` | `"1.2.3"`, `""` at startup | agy version |
| `product` | `"antigravity"` | |
| `agent_state` | `authenticating` → `initializing` → `idle` / `working` | |
| `context_window.total_input_tokens` / `total_output_tokens` | number | cumulative |
| `context_window.context_window_size` | `250000` | `0` at startup |
| `context_window.used_percentage` / `remaining_percentage` | float | |
| `context_window.current_usage` | `null`, or `{ input_tokens, output_tokens, cache_creation_input_tokens, cache_read_input_tokens }` | last turn |
| `exceeds_200k_tokens` | `null` at startup, then bool | |
| `quota["gemini-5h" \| "gemini-weekly" \| "3p-5h" \| "3p-weekly"]` | `{ remaining_fraction, reset_time (ISO), reset_in_seconds }` | `3p` = third-party models (Claude, GPT) |
| `plan_tier` | `"Google AI Pro"` | |
| `email` | the account email | personal data. Don't show it by default or in screenshots |
| `sandbox.enabled` | bool | |
| `terminal_width` | number | updates on resize |
| `vcs` | `{ "type": "git" }` | **only present inside a repo. No branch name.** There is **no `git` object** anymore |

Not observed but present as types in the agy binary (probably omitted when empty): `StatusLineCost`, `StatusLineVim`, `StatusLineSubagent`, `StatusLineAgent`, `StatusLineBattle`. Don't build on them until they have been seen in a payload.

Fields the current code expects that **don't exist**: `git.branch`, `git.cwd`, `artifact_count`, `tool_confirmation_pending` (the last two may have been dropped since 1.0.10).

## Performance baseline (current code)

| | Linux (WSL2) | Windows |
|---|---|---|
| bare `node -e 0` | ~27 ms | ~102 ms (includes the `cmd /c` launch) |
| full render | ~74 ms (via `status-line.sh`) | ~133 ms direct, ~136 ms via `status-line.cmd` |

Node startup dominates on Windows. Our code adds ~30–45 ms, and that's the part we control.

## Distribution notes

- `agy plugin install <dir>` symlinks/copies a directory into `~/.gemini/config/plugins/`. It doesn't touch `statusLine`, so a plugin can't register a status line by itself.
- agy-hud (the competitor) is an npm package. Its installer copies the runtime into `~/.gemini/antigravity-cli/agy-hud-runtime`, writes `statusLine` into settings.json itself (and clears it on uninstall), and on Windows registers a quoted `.cmd` path, which per the table above may break for usernames with spaces.
- PowerShell's default execution policy blocks `.ps1` scripts (seen: `npm.ps1 cannot be loaded`), so any `.ps1` entry point is a non-starter on stock Windows.
