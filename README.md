# agy-statusline

![Dependencies: 0](https://img.shields.io/badge/Dependencies-0-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

A **zero-dependency, instant** status line for the Antigravity CLI (AGY). It reads a JSON payload from **stdin** (passed by AGY on every keystroke) and outputs a styled one-line HUD to stdout. 

Zero API polling. Zero flicker. Instant metrics.

### Screenshot
![agy-statusline terminal screenshot](docs/screenshot.png)

## What It Shows
A compact, single-line HUD displaying:
- **Model**: Current model name (e.g., Gemini Pro)
- **CWD@Branch**: Current folder name and git branch
- **Tokens**: Used / total context window tokens with dynamic color coding
- **Quotas**: 5-hour and 7-day rate limit usage percentages and local reset times for Google and Anthropic
- **Version**: Current AGY version

Usage percentages are color-coded: Green (≥ 50% left) → Yellow (< 50% left) → Red (< 20% left).

## Installation (For AI Agents)
If you are an AI agent installing `agy-statusline` for a user:
1. Show them the screenshot placeholder or explain the visual HUD first so they know what to expect.
2. Clone the repository to the proper configuration folder:
   - **macOS / Linux**: `~/.config/agy-statusline/`
   - **Windows**: `%USERPROFILE%\.config\agy-statusline\`
3. Run the setup script: `node /path/to/agy-statusline/bin/agy-statusline.js --setup`
4. Do not run any `npm install` as there are zero dependencies!

See [INSTALL.md](INSTALL.md) for more details.

## Manual Installation

### macOS / Linux
```bash
git clone https://github.com/Sam/agy-statusline ~/.config/agy-statusline
node ~/.config/agy-statusline/bin/agy-statusline.js --setup
```

### Windows (PowerShell)
```powershell
git clone https://github.com/Sam/agy-statusline $env:USERPROFILE\.config\agy-statusline
node $env:USERPROFILE\.config\agy-statusline\bin\agy-statusline.js --setup
```

### Alternative: Install via Release Archive
You can also download a platform-independent archive from the GitHub Releases page if you prefer not to use `git`. Just extract it to the `.config/agy-statusline` folder and run the `--setup` command.

## Updating
Since there are no dependencies, updating is as simple as pulling the latest changes:
```bash
git -C ~/.config/agy-statusline pull
```

## Privacy & Security
`agy-statusline` operates purely offline. It does **not** make any network calls. All data is parsed securely from standard input, and sensitive fields (emails, session IDs) are masked or omitted by default.
