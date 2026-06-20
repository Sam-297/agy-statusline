# AI Agent Installation Instructions

**Role:** You are an AI assistant helping the user install `agy-statusline`.
**Goal:** Install the status line, configure it, and verify the installation.

### Step 1: Clone the repository
Run the following command in the user's preferred tools directory (default to `~/.local/share/` if unsure):
```bash
git clone https://github.com/yourname/agy-statusline.git ~/.local/share/agy-statusline
```

### Step 2: Run the Setup Script
Execute the setup script to automatically configure the AGY settings atomically:
```bash
node ~/.local/share/agy-statusline/bin/agy-statusline.js --setup
```

### Step 3: Verification (CRITICAL)
Do not report success until you have verified the configuration:
1. Read `~/.gemini/antigravity-cli/settings.json` (or OS equivalent).
2. Ensure the `statusLine.command` key points to the `agy-statusline.js` script.

### Step 4: Configuration (Optional)
If the user asked for specific segments, create `~/.config/agy-statusline/config.json` with the requested JSON schema.
