# agy-statusline Themes

This directory contains pre-built themes for `agy-statusline`. 

## How to Apply a Theme

To apply a theme, simply copy the theme file to your AGY configuration folder. Once copied, restart your `agy` session to see the new status line in action.

*(**Windows Users**: Replace `cp` with `Copy-Item` and `~` with `$HOME`. See the **[Windows Cheatsheet](#windows-powershell-cheatsheet)** at the bottom).*

### Default

![Default Theme](../docs/theme_default.png)

To go back to the standard, minimalist default look, simply delete your configuration file:

```bash
rm -f ~/.config/agy-statusline/config.js
```

### Cyberpunk

![Cyberpunk Theme](../docs/theme_cyberpunk.png)

```bash
cp ~/.agy-plugins/agy-statusline/themes/cyberpunk.js ~/.config/agy-statusline/config.js
```

### Dashboard

![Dashboard Theme](../docs/theme_dashboard.png)

```bash
cp ~/.agy-plugins/agy-statusline/themes/dashboard.js ~/.config/agy-statusline/config.js
```

### Elegant

![Elegant Theme](../docs/theme_elegant.png)

```bash
cp ~/.agy-plugins/agy-statusline/themes/elegant.js ~/.config/agy-statusline/config.js
```

### Progress Bar

![Progress Bar Theme](../docs/theme_progress-bar.png)

```bash
cp ~/.agy-plugins/agy-statusline/themes/progress-bar.js ~/.config/agy-statusline/config.js
```

### Retro

![Retro Theme](../docs/theme_retro.png)

```bash
cp ~/.agy-plugins/agy-statusline/themes/retro.js ~/.config/agy-statusline/config.js
```

---

### Windows (PowerShell) Cheatsheet

If you are on Windows using PowerShell, the commands are slightly different:

**Apply a Theme:**
```powershell
Copy-Item -Path $HOME\.agy-plugins\agy-statusline\themes\cyberpunk.js -Destination $HOME\.config\agy-statusline\config.js -Force
```

**Revert to Default:**
```powershell
Remove-Item -Path $HOME\.config\agy-statusline\config.js -Force -ErrorAction SilentlyContinue
```
