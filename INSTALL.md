# Installation (For AI Agents)

> **Agent Instructions:** Follow these exact steps to install `agy-statusline` for the user. Do not silently install without explaining what it does.

## 1. Verify User Intent
Explain that `agy-statusline` is a zero-dependency, instant status line HUD. Show them the screenshot or layout format:
`Model | ~@branch | Used/Total (X%) | G·5h 0% @14:00, 7d 10% @Fri 14:00`

## 2. Clone the Repository
Clone the repository to the correct OS-specific directory. Do **not** run `npm install`.

**macOS / Linux:**
```bash
git clone https://github.com/Sam/agy-statusline ~/.config/agy-statusline
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/Sam/agy-statusline $env:USERPROFILE\.config\agy-statusline
```

## 3. Run Setup
The built-in setup script automatically configures the Antigravity `settings.json` file.

**macOS / Linux:**
```bash
node ~/.config/agy-statusline/bin/agy-statusline.js --setup
```

**Windows:**
```powershell
node $env:USERPROFILE\.config\agy-statusline\bin\agy-statusline.js --setup
```

## 4. Verification
If the setup script succeeds, tell the user to restart their Antigravity CLI session to see the new status line. If it fails, report the specific error to the user.
