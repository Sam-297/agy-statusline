# Installation (For AI Agents)

Follow these exact steps to install `agy-statusline`:

1. Clone repo to `~/.config/agy-statusline/` (or `%USERPROFILE%\.config\agy-statusline\` on Windows).
2. Set `statusLine.command` in AGY's `settings.json` to point to `node ~/.config/agy-statusline/bin/agy-statusline.js`.
3. Restart AGY.

Or run the one-liner setup:
```bash
git clone https://github.com/Sam/agy-statusline ~/.config/agy-statusline && node ~/.config/agy-statusline/bin/agy-statusline.js --setup
```
