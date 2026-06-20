# ⚡ agy-statusline

A blazing-fast, infinitely customizable status line plugin for the Antigravity CLI.

It hooks natively into AGY, reading the internal state stream to render a live, zero-latency HUD on every keystroke. No background polling. No lag.

## ✨ Features
- **Zero Network Lag**: Instant context tracking using AGY's native state stream.
- **100% Programmable**: Don't like our layout? Write your own custom widgets in pure JavaScript. 
- **Zero Dependencies**: Pure Node.js. No `node_modules` clutter.

## 🚀 Installation

Run this simple one-liner to download and install the plugin globally:

```bash
git clone https://github.com/Sam-297/agy-statusline /tmp/agy-statusline && agy plugin install /tmp/agy-statusline && rm -rf /tmp/agy-statusline
```

## 🎨 Themes

Check out the [`themes/`](themes/) directory for pre-built configurations you can copy and paste!

| Default Line | Retro Progress Bar | Dashboard |
|---|---|---|
| ![Default Theme](docs/theme_default.png) | ![Retro Theme](docs/theme_retro.png) | ![Dashboard Theme](docs/theme_dash.png) |
| *The classic agy-statusline.* | *Replaces tokens with a progress bar.* | *Multi-line, bordered TUI dashboard.* |

**To use a theme:**
```bash
cp themes/dashboard.js ~/.config/agy-statusline/config.js
```

## 🛠️ Customizability

Unlike plugins that force you to use static JSON, `agy-statusline` is fully programmable.

To customize your HUD, create this file: `~/.config/agy-statusline/config.js`

### Available Built-in Segments

You can arrange these built-in strings in any order:
- `"model"`: e.g. `Gemini Pro`
- `"cwd_branch"`: e.g. `~@main` or `agy-statusline@feat`
- `"tokens"`: e.g. `1.5k/10k (15%)`
- `"quota_gemini"`: Google API rate limits (`G·5h ...`)
- `"quota_anthropic"`: Anthropic API rate limits (`C·5h ...`)
- `"version"`: e.g. `v1.0.10`
- `"extras"`: Tool confirmation warnings and sandbox flags
- `"email_masked"`: Masked email (`s***@gmail.com`)
- `"email"`: Full email address
- `"session_id_short"`: Truncated session ID
- `"session_id"`: Full session ID
- `"agent_state"`: Current agent state
- `"plan_tier"`: Your subscription tier
- `"product"`: The AGY product name
- `"artifact_count"`: Number of artifacts in the session

### Writing Custom Segments

If the built-ins aren't enough, just write a JavaScript function. Your function receives the live `payload` from AGY, plus a `utils` object loaded with TrueColor ANSI wrappers and number formatters.

```javascript
export default {
  separator: " • ",
  segments: [
    "model",
    "cwd_branch",
    
    // Write your own segment in pure JS!
    (payload, utils) => {
      const mem = process.memoryUsage().heapUsed / 1024 / 1024;
      return utils.colors.purple(`RAM: ${Math.round(mem)}MB`);
    },
    
    "tokens"
  ]
};
```



## 🔒 Privacy
Operates purely offline. All metrics are parsed safely from AGY's internal stream.
