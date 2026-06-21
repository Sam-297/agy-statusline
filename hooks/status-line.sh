#!/usr/bin/env sh
set -eu
unset NODE_OPTIONS
exec node "$(dirname "$0")/../bin/agy-statusline" "$@"
