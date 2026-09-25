# Changelog

## 2.0.0 (2026-09-25)

A rebuild based on how agy 1.2.x actually behaves, measured on Linux and native Windows ([docs/agy-contract.md](docs/agy-contract.md)). Details and reasoning: [docs/audit.md](docs/audit.md).

### Install

- New install: `npm i -g https://github.com/Sam-297/agy-statusline/releases/latest/download/agy-statusline.tgz`, then `agy-statusline install`.
- `agy-statusline install` writes agy's `settings.json` for you, using a command form that works on Windows (including usernames with spaces). `agy-statusline uninstall` restores whatever you had before.
- Removed: the `agy plugin install` flow, `hooks/`, `hooks.json`, `plugin.json`. They never wired up the status line.

### Works everywhere, never breaks agy

- **Windows works.** 1.x couldn't run there: quoted paths broke, and `.ps1` scripts are blocked by default.
- Render mode always exits 0. A slow or broken segment shows `[name: timeout]` / `[name: error]` inline instead of a `⚠ Statusline Error` in your chat. There's a 300 ms budget per segment and a 3 s hard deadline.
- Config mistakes (unknown segment, syntax error, unknown theme) show as a yellow `⚠ …` in the line instead of failing silently.
- Correct width math for emoji, CJK and ANSI: segments are dropped by priority, then truncated with `…`, so lines never wrap.

### Data

- Reads the current agy payload. The git branch now shows again (agy stopped sending it; it's read from `.git/HEAD`). Context % matches agy's own number, and quota is always shown as *used* %.
- No fake placeholders at startup, and no email or session id unless you add those segments.

### Themes & config

- Themes are picked by name: `agy-statusline theme <name>`, `agy-statusline themes`, `agy-statusline preview`. Theme updates now reach you (1.x copied theme code into your config).
- All six themes were rebuilt, and there are two new ones: **`quota`** (bars and reset times for both providers' 5h and 7d windows) and **`powerline`** (needs a Nerd Font).
- Custom segments get richer `utils` (`data.*`, `format.*`, `displayWidth`, `truncate`, `width`) and can set a `priority`.
- 1.x configs keep working. `tokens`, `quota_anthropic`, `quota_openai`, `extras` and `session_id` are aliases, and `--setup`, `--load-theme` and `--list-themes` still work. `--save-theme` and `--delete-theme` were removed.

### Speed

- ~40–45 ms per render on Linux (1.x: ~74 ms) and ~118 ms on Windows, of which ~86 ms is Node's own startup. The release ships the render path as a single bundled file.

### Security

- The registered command can no longer be interpreted by `sh` if the install path contains `$(…)` or backticks.
- `uninstall` only removes the exact command that `install` registered.
