# agy-statusline Themes

This directory contains pre-built themes for `agy-statusline`. 

## How to Apply a Theme

To apply a theme, run the `--load-theme` command corresponding to your OS. Once loaded, restart your `agy` session to see the new status line in action.

### Default

![Default Theme](../docs/theme_default.png)

To go back to the standard, minimalist default look:

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme default
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme default
```

### Cyberpunk

![Cyberpunk Theme](../docs/theme_cyberpunk.png)

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme cyberpunk
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme cyberpunk
```

### Dashboard

![Dashboard Theme](../docs/theme_dashboard.png)

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme dashboard
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme dashboard
```

### Elegant

![Elegant Theme](../docs/theme_elegant.png)

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme elegant
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme elegant
```

### Progress Bar

![Progress Bar Theme](../docs/theme_progress-bar.png)

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme progress-bar
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme progress-bar
```

### Retro

![Retro Theme](../docs/theme_retro.png)

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme retro
```
**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme retro
```

## Custom Themes

The plugin comes with a fully-featured built-in CLI to manage your own personalized themes. 

Whenever you manually edit your configuration file to create a layout you like, you can save it so you don't lose it when testing other themes. 

**1. Save your active config as a theme:**
This securely copies your current active config to the internal themes directory.
- **Mac/Linux:** `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --save-theme <name>`
- **Windows:** `node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --save-theme <name>`

**2. List all available themes:**
Shows both pre-built themes and your saved custom themes.
- **Mac/Linux:** `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --list-themes`
- **Windows:** `node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --list-themes`

**3. Load your custom theme:**
Applies the theme back to your active configuration (just like the pre-built themes above).
- **Mac/Linux:** `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme <name>`
- **Windows:** `node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --load-theme <name>`

**4. Delete a custom theme:**
Deletes the theme from the saved list.
- **Mac/Linux:** `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --delete-theme <name>`
- **Windows:** `node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --delete-theme <name>`
