$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
node "$scriptDir\..\bin\agy-statusline" @args
