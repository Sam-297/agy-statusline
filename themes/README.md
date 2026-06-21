# agy-statusline Themes

This directory contains pre-built themes for `agy-statusline`. 


## Windows Compatibility
**Important for Windows users:** Default Windows PowerShell (5.1) does not expand the `~` symbol for external commands like Node. In all the commands below, if you are on Windows, replace `~/.agy-plugins/agy-statusline/bin/agy-statusline` with `$HOME\.agy-plugins\agy-statusline\bin\agy-statusline`.

## Custom Themes
You can manage your own custom themes using the built-in CLI:
- **Save current config as a theme**: `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --save-theme <name>`
- **Load a theme**: `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme <name>`
- **List themes**: `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --list-themes`
- **Delete a theme**: `node ~/.agy-plugins/agy-statusline/bin/agy-statusline --delete-theme <name>`

## How to Apply a Theme

To apply a theme, navigate to the `agy-statusline` plugin directory and run the `--load-theme` command. Once loaded, restart your `agy` session to see the new status line in action.

### Default

![Default Theme](../docs/theme_default.png)

To go back to the standard, minimalist default look:

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme default
```

### Cyberpunk

![Cyberpunk Theme](../docs/theme_cyberpunk.png)

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme cyberpunk
```

### Dashboard

![Dashboard Theme](../docs/theme_dashboard.png)

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme dashboard
```

### Elegant

![Elegant Theme](../docs/theme_elegant.png)

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme elegant
```

### Progress Bar

![Progress Bar Theme](../docs/theme_progress-bar.png)

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme progress-bar
```

### Retro

![Retro Theme](../docs/theme_retro.png)

```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --load-theme retro
```
