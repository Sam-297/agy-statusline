# agy-statusline

![Dependencies: 0](https://img.shields.io/badge/Dependencies-0-success)
![License: MIT](https://img.shields.io/badge/License-MIT-blue)

A **zero-dependency, instant** status line for the Antigravity CLI (AGY). It reads a JSON payload from **stdin** and outputs a styled one-line HUD to stdout. 

Zero API polling. Zero flicker. Instant metrics.

## Features
- **Instant**: No API calls, no latency — data arrives via stdin.
- **100% accurate quotas**: Both 5h and 7d windows, both providers, live from AGY.
- **Zero dependencies**: Single-file Node.js, no `npm install` needed.

## Installation

```bash
git clone https://github.com/Sam/agy-statusline ~/.config/agy-statusline && node ~/.config/agy-statusline/bin/agy-statusline.js --setup
```

See [INSTALL.md](INSTALL.md) for detailed instructions.
