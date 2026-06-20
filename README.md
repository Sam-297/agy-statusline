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
2. Clone the repository to a temporary directory:
   ```bash
   git clone https://github.com/Sam/agy-statusline /tmp/agy-statusline
   ```
3. Install the plugin using `agy plugin install`:
   ```bash
   agy plugin install /tmp/agy-statusline
   ```
4. Do not run any `npm install` as there are zero dependencies!

See [INSTALL.md](INSTALL.md) for more details.

## Manual Installation

### From Source
```bash
git clone https://github.com/Sam/agy-statusline /tmp/agy-statusline
agy plugin install /tmp/agy-statusline
```

### Alternative: Install via Release Archive
You can download a platform-independent archive from the GitHub Releases page:
```bash
curl -fsSL -o agy-statusline.tar.gz https://github.com/Sam/agy-statusline/releases/latest/download/agy-statusline.tar.gz
tar -xzf agy-statusline.tar.gz
agy plugin install ./agy-statusline
```

## Updating
Since there are no dependencies, updating is as simple as pulling the latest changes:
```bash
git -C ~/.config/agy-statusline pull
```

## Privacy & Security
`agy-statusline` operates purely offline. It does **not** make any network calls. All data is parsed securely from standard input, and sensitive fields (emails, session IDs) are masked or omitted by default.
