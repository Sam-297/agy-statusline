# agy-statusline Themes

This directory contains pre-built themes for `agy-statusline`. 


## Windows Compatibility
*(Note: PowerShell users can use `~` just like Unix. Command Prompt users must use their full absolute path instead of `~`)*

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
