# agy-statusline

**A lightweight terminal HUD for the Antigravity CLI (agy).**

`agy-statusline` provides a dynamic heads-up display directly in your terminal.

### 🎨 Featured Themes

![Default Theme](docs/theme_default.png)
![Dashboard Theme](docs/theme_dashboard.png)

[View the full Themes Gallery →](themes/README.md)

### Why `agy-statusline`?

- **Local Execution:** Everything happens locally. No waiting on API responses to update your HUD.
- **Zero Dependencies:** Built lean and mean. Absolutely zero npm runtime dependencies.
- **Endless Customizability:** Choose from a gallery of beautiful pre-built themes, or program your own completely custom layout in JavaScript.

Get the data you need, the moment you need it, without slowing down your workflow.

## Installation & Setup

Welcome to the `agy-statusline` setup guide! Follow these simple steps to get your blazing-fast status line up and running.

### 1. Install the Plugin

**macOS / Linux:**
```bash
mkdir -p ~/.agy-plugins
git clone https://github.com/Sam-297/agy-statusline ~/.agy-plugins/agy-statusline
agy plugin install ~/.agy-plugins/agy-statusline
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path $HOME\.agy-plugins
git clone https://github.com/Sam-297/agy-statusline $HOME\.agy-plugins\agy-statusline
agy plugin install $HOME\.agy-plugins\agy-statusline
```

### 2. Configuration (Optional)

`agy-statusline` works perfectly out of the box, but it is also 100% programmable. You can customize the layout, colors, and segments by creating a personal configuration file.

**macOS / Linux:**
```bash
mkdir -p ~/.config/agy-statusline
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path $HOME\.config\agy-statusline
```

### Try a Pre-built Theme

We offer several beautiful pre-built themes (Dashboard, Cyberpunk, Retro, etc.). 
Check out the **[Themes Gallery](themes/README.md)** to see screenshots and installation instructions!

### Write Your Own Custom Layout

If you prefer to write your own configuration from scratch, create `~/.config/agy-statusline/config.mjs` and export your layout. For example:

```javascript
export default {
  separator: " • ",
  segments: [
    "model",
    "cwd_branch",
    "tokens"
  ]
};
```

*(Note: Once installed and configured, simply restart your Antigravity CLI session to see your new status line in action!)*
