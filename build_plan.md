# agy-statusline — Build Plan

> **Repo**: `agy-statusline`
> **License**: MIT (Copyright Sam)
> **Language**: Node.js (zero npm dependencies)
> **Platforms**: Linux, macOS, Windows

---

## 1. What It Is

A **zero-dependency, instant** status line for the [Antigravity CLI](https://github.com/anthropics/anthropic-cookbook). It reads a JSON payload from **stdin** (passed by AGY on every keystroke) and outputs a styled one-line HUD to stdout. No network calls, no API scraping, no background processes.

### The Competitive Edge (don't reveal the trick, just flex the result)
- **Instant**: No API calls, no latency — data arrives via stdin
- **100% accurate quotas**: Both 5h and 7d windows, both providers, live from AGY itself
- **Zero dependencies**: Single-file Node.js, no `npm install` needed

---

## 2. Default Layout

```
Model | ~@branch | Used/Total (X%) | G·5h 0% @14:00, 7d 10% @Fri 14:00 | C·5h 5% @16:00, 7d 20% @Mon 07:00 | v1.0.10
```

### Segment Breakdown

### Segment Breakdown

| # | Segment | Source | Colors |
|---|---------|--------|--------|
| 1 | **Model** | `model.display_name` | Blue |
| 2 | **CWD@Branch** | `cwd` + `.git/HEAD` | CWD default terminal color (reset), `@` dim, branch green. (If no git repo, hide the `@branch` entirely). Show **basename** of CWD. If exact match to home dir, show `~`. |
| 3 | **Tokens** | `context_window.total_input_tokens` / `context_window.total_output_tokens` | Dynamic: green→yellow→orange→red |
| 4 | **G quota** | `quota.gemini-5h` + `quota.gemini-weekly` | `G·` dim, pct dynamic, reset time dim with `@` |
| 5 | **C quota** | `quota.3p-5h` + `quota.3p-weekly` | `C·` dim, pct dynamic, reset time dim with `@` (Hide OpenAI) |
| 6 | **Version** | `version` from payload | Entirely Orange |

### Quota Format Per Provider
```
G·5h 0% @14:00, 7d 10% @Fri 14:00
```
- Provider letter + `·` in dim
- 5h and 7d separated by a dim comma `,`
- Percentage colored dynamically based on **used** fraction: Green (< 50% used), Yellow (≥ 50% used), Orange (≥ 70% used), Red (≥ 90% used).
- Reset times in dim with `@` prefix
- 5h: time only (`@14:00`)
- 7d: day + time (`@Fri 14:00`)

### Optional/Extra Segments (all configurable)
| Segment | Source | Default |
|---------|--------|---------|
| **Tool Confirmation** | `tool_confirmation_pending` | off |
| **Agent State** | `agent_state` | off |
| **Plan Tier** | `plan_tier` | off |
| **Session ID** | `session_id` | off |
| **Email** | `email` | off |
| **Artifact Count** | `artifact_count` | off |
| **Output Tokens** | `context_window.total_output_tokens` | off |
| **Product** | `product` | off |
| **Terminal Width** | `terminal_width` | off |
| **Sandbox** | `sandbox.enabled` | off |
| **Exceeds 200k** | `exceeds_200k_tokens` | off |

---

## 3. ANSI Color Palette

```
Reset:    \x1b[0m
Dim:      \x1b[2m        (pipes, separators, provider tags, @, ·, times)
Blue:     \x1b[38;2;0;153;255m  (model name)
Orange:   \x1b[38;2;255;176;85m (version, warning %)
Green:    \x1b[38;2;0;160;0m    (git branch, good %)
Cyan:     \x1b[38;2;46;149;153m (directories)
Red:      \x1b[38;2;255;85;85m  (bad %)
Yellow:   \x1b[38;2;230;200;0m  (medium %)
Purple:   \x1b[38;2;167;139;250m
White:    \x1b[38;2;220;220;220m
```

---

## 4. Config File (Programmable Customization)

Location: `~/.config/agy-statusline/config.js` (or `.mjs`). If no config exists, uses hardcoded defaults.

Unlike static JSON, `agy-statusline` uses a JavaScript config to allow infinite visual customization (e.g., progress bars, multi-line elements).

```javascript
export default {
  // Global settings
  separator: " | ", 
  hide_openai: true,
  google_label: "G",
  anthropic_label: "C",
  
  // Array of segments (mix of strings and functions)
  segments: [
    "model",       // Built-in string segment
    "cwd_branch",  // Built-in string segment
    
    // Custom programmable segment
    (payload, utils) => {
      const used = payload.tokens.tokens_used;
      const total = payload.tokens.tokens_total;
      
      // Custom visual logic using built-in utils
      const bar = utils.progressBar(used, total, 10);
      return `Usage: ${utils.colors.cyan(bar)}`;
    },
    
    "version"
  ]
};
```

**How it works:**
- The core engine dynamically imports `config.js`.
- For string segments, it delegates to built-in rendering logic.
- For function segments, it executes them and injects the raw `payload` and a `utils` object (ANSI colors, bar generators, formatters).

---

## 5. File Structure (Feature-First Architecture)

```
agy-statusline/
├── bin/
│   ├── agy-statusline.js          # Entry point
│   └── agy-statusline.cmd         # Windows wrapper
├── src/
│   ├── core/                      # Core engine
│   │   ├── parser.js              # JSON payload parser
│   │   ├── config.js              # Config loader
│   │   ├── colors.js              # ANSI definitions
│   │   └── renderer.js            # HUD assembler
│   ├── features/                  # Feature modules (Feature-First)
│   │   ├── quota/                 # Quota parsing & rendering
│   │   ├── tokens/                # Token usage & context burn rate
│   │   ├── git/                   # Git branch & cwd
│   │   ├── system/                # OS metrics (disk, load)
│   │   └── session/               # Version, model, state, extras
│   └── utils/
│       └── format.js              # Time & number formatters
├── tests/
│   ├── core/
│   └── features/
├── .github/
├── README.md, INSTALL.md, CHANGELOG.md, LICENSE
└── package.json
```

---

## 6. Installation Methods

### A. AI Agent Installation (INSTALL.md)
Step-by-step instructions that an AI agent (Claude, Gemini, etc.) can follow:
1. Clone repo to `~/.config/agy-statusline/` (or `%USERPROFILE%\.config\agy-statusline\` on Windows)
2. Set `statusLine.command` in AGY's `settings.json`
3. Restart AGY

### B. Manual Installation (README.md)
Same steps but explained for humans with copy-paste commands.

### C. One-liner
```bash
git clone https://github.com/Sam/agy-statusline ~/.config/agy-statusline && node ~/.config/agy-statusline/bin/agy-statusline.js --setup
```

The `--setup` flag auto-detects the AGY settings.json location and writes the statusLine config.

---

## 7. Implementation Slices

### Slice 1: Core Foundation
- [ ] `package.json` (no deps, `node:test` for testing)
- [ ] `lib/colors.js` — ANSI color constants
- [ ] `lib/parse-payload.js` — JSON stdin parser with validation
- [ ] `lib/git.js` — sync `git rev-parse` with fast timeout
- [ ] `lib/config.js` — config file loader with defaults
- [ ] Tests for all above

### Slice 2: Segments
- [ ] `lib/segments/model.js`
- [ ] `lib/segments/cwd-branch.js`
- [ ] `lib/segments/tokens.js`
- [ ] `lib/segments/quota.js`
- [ ] `lib/segments/version.js`
- [ ] `lib/segments/extras.js`
- [ ] Tests for all segments

### Slice 3: Entry Point + Integration
- [ ] `bin/agy-statusline.js` — main entry point
- [ ] `bin/agy-statusline.cmd` — Windows wrapper
- [ ] Integration tests (feed sample payload → verify output)
- [ ] `--setup` flag for auto-configuration
- [ ] `--help` flag

### Slice 4: Documentation
- [ ] `README.md` — polished, with badges, screenshots placeholder, feature list
- [ ] `INSTALL.md` — AI-agent-friendly step-by-step
- [ ] `CHANGELOG.md`
- [ ] `LICENSE` (MIT)
- [ ] `.gitignore`

### Slice 5: CI + GitHub Extras
- [ ] `.github/workflows/ci.yml` — test on Node 20+ on Linux/macOS/Windows
- [ ] `.github/ISSUE_TEMPLATE/bug_report.md`
- [ ] `.github/ISSUE_TEMPLATE/feature_request.md`

### Slice 6: QA + Polish
- [x] Security review (no eval, no network calls, safe stdin handling)
- [x] Cross-platform testing (path separators, line endings)
- [x] Edge cases (missing payload fields, empty stdin, corrupt JSON)
- [x] Performance check (must complete in <100ms)

### Slice 7: Themes & Advanced Examples
- [ ] Create ultra-complex, multi-line theme examples in `examples/`
- [ ] Document all built-in segments in README
- [ ] Add theme screenshot gallery placeholders in README

---

## 8. Subagent Enhancements (To Implement)

**Performance & Core:**
- **No Git Shelling**: Read `.git/HEAD` via native `fs.readFileSync`. Zero child processes = 0ms latency.
- **DoS Protection**: Cap stdin at 64KB. Use async `process.stdin` with 1.5s `setTimeout` to prevent hangs. Wrap `JSON.parse` in `try/catch`. Fallback safely on bad JSON.
- **Progressive Truncation**: Use `terminal_width` to hide elements (version -> quotas -> cwd) on narrow screens so it stays exactly one line.

**Features & Output:**
- **Smart 3p Mapping**: Enforce `C` (Claude) with Anthropic color for all `3p` quotas (user choice, no `O`).
- **Timezones**: Parse UTC `reset_time` into local timezone using `Intl.DateTimeFormat`.
- **Tool Alerts**: If `tool_confirmation_pending` is true, render a prominent `⚡CONFIRM` alert.
- **Color Safety**: Respect standard `NO_COLOR` environment variable.

**Security & Setup:**
- **Atomic Setup**: `--setup` writes to temp file first, then renames, preventing AGY settings corruption.
- **Data Masking**: If user enables `email` or `session_id` segments, mask them (`s***@gmail.com`) by default.
- **Dev Tools**: ESLint, Prettier, and Husky configured in `devDependencies` to enforce code quality locally.

**DX & Docs:**
- **AI Prompt Install**: `INSTALL.md` formatted as a strict AI system prompt.
- **Zero Badge**: Prominent `[Dependencies: 0]` badge on README.
- **Positioning**: "Zero API polling. Zero flicker. Instant metrics."

---

## 9. Agent Architecture

```
┌─────────────────────────────────┐
│        USER (Approval)          │
└───────────────┬─────────────────┘
                │
┌───────────────▼─────────────────┐
│        Gemini Pro Lead          │
│       (Orchestration)           │
└───────────────┬─────────────────┘
                │
       ┌────────┴────────┐
       │                 │
┌──────▼──────┐   ┌──────▼──────┐
│ Gemini Coder│   │  Gemini QA  │
│  (Impl)     │   │   (Tests)   │
└─────────────┘   └─────────────┘
```

- **Opus** (me): Architect. Writes specs, reviews code, handles edge cases. Minimal direct coding to conserve quota.
- **Coder subagent** (Gemini): Implements source code per slice specifications.
- **QA subagent** (Gemini): Writes tests, runs them, reviews code for bugs/security.

---

## 9. Removal of agy-hud

Before or after building agy-statusline, we need to:
1. Update `~/.gemini/antigravity-cli/settings.json` to point to the new status line
2. Optionally remove the agy-hud plugin from `~/.gemini/config/plugins/agy-hud/`

This will be the final step after everything is working.

---

## 10. Security Considerations

- **No network calls** — ever. All data comes from stdin.
- **No `eval()` or `Function()`** — JSON.parse only.
- **No file writes** except the optional `--setup` config.
- **stdin timeout** — cap at 1.5s to prevent hanging.
- **Safe git execution** — `execSync` with timeout, stderr suppressed.
- **No secrets in output** — session IDs, emails, etc. are opt-in only.

---

> [!IMPORTANT]
> **Ready to proceed?** This plan covers all decisions from our interview. Hit Proceed to start implementation with the multi-agent architecture.
