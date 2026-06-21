$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Remove-Item Env:\NODE_OPTIONS -ErrorAction SilentlyContinue
node "$scriptDir\..\bin\agy-statusline" @args
