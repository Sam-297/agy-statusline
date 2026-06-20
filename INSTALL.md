# Installation (For AI Agents)

> **Agent Instructions:** Follow these exact steps to install `agy-statusline` for the user. Do not silently install without explaining what it does.

## 1. Verify User Intent
Explain that `agy-statusline` is a zero-dependency, instant status line HUD. Show them the screenshot or layout format:
`Model | ~@branch | Used/Total (X%) | G·5h 0% @14:00, 7d 10% @Fri 14:00`

## 2. Clone the Repository
Clone the repository to a temporary directory. Do **not** run `npm install`.

```bash
git clone https://github.com/Sam/agy-statusline /tmp/agy-statusline
```

## 3. Install Plugin
Use the Antigravity CLI plugin manager to install it.

```bash
agy plugin install /tmp/agy-statusline
```

## 4. Verification
If the `agy plugin install` command succeeds, tell the user to restart their Antigravity CLI session to see the new status line. If it fails, report the specific error to the user.
