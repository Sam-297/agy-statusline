#!/usr/bin/env sh
set -eu
PRG="$0"
while [ -h "$PRG" ]; do
  ls=$(ls -ld "$PRG")
  link=$(expr "$ls" : '.*-> \(.*\)$')
  if expr "$link" : '/.*' > /dev/null; then
    PRG="$link"
  else
    PRG="$(dirname "$PRG")/$link"
  fi
done
PLUGIN_DIR="$(cd "$(dirname "$PRG")/.." && pwd)"

unset NODE_OPTIONS
exec node "$PLUGIN_DIR/bin/agy-statusline" "$@"
