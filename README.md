# agy-statusline

**A lightweight terminal HUD for the Antigravity CLI (agy).**

`agy-statusline` provides a dynamic heads-up display directly in your terminal.

![Default Theme](docs/theme_default.png)
![Dashboard Theme](docs/theme_dashboard.png)

### Why `agy-statusline`?

- **Local Execution:** Everything happens locally. No waiting on API responses to update your HUD.
- **Zero Dependencies:** Built lean and mean. Absolutely zero npm runtime dependencies.
- **Endless Customizability:** Choose from a gallery of beautiful pre-built themes, or program your own completely custom layout in JavaScript.

Get the data you need, the moment you need it, without slowing down your workflow.

## Installation & Setup

Welcome to the `agy-statusline` setup guide! Follow these simple steps to get your blazing-fast status line up and running. *(Requires **Node.js** and **Git** to be installed).*

### 1. Install the Plugin

**macOS / Linux:**
```bash
mkdir -p ~/.agy-plugins
git clone https://github.com/Sam-297/agy-statusline ~/.agy-plugins/agy-statusline
agy plugin install ~/.agy-plugins/agy-statusline
```

**Windows (PowerShell):**
```powershell
mkdir -Force $HOME\.agy-plugins
git clone https://github.com/Sam-297/agy-statusline $HOME\.agy-plugins\agy-statusline
agy plugin install $HOME\.agy-plugins\agy-statusline
```

### 2. Activate the Status Line

To activate the status line, navigate to the plugin directory and run the setup command to get your activation code:

**macOS / Linux:**
```bash
node ~/.agy-plugins/agy-statusline/bin/agy-statusline --setup
```

**Windows (PowerShell):**
```powershell
node $HOME\.agy-plugins\agy-statusline\bin\agy-statusline --setup
```

## Themes & Customization

`agy-statusline` works perfectly out of the box, but it is also 100% programmable. You can customize the layout, colors, and segments by either writing a personal configuration file or using one of our pre-built themes (Dashboard, Cyberpunk, Retro, etc.).

🎨 **[Check out the Themes Gallery & Customization Guide](themes/README.md)**

There you will find:
- Screenshots and one-line setup commands for all pre-built themes.
- A full tutorial on how to program your own **Custom Themes** in JavaScript.
- Instructions on using the built-in CLI to save and manage your configurations.

*(Note: Once installed and configured, simply restart your Antigravity CLI session to see your new status line in action!)*
