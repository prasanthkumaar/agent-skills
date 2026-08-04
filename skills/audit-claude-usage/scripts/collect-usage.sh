#!/bin/sh

set -eu

if ! command -v node >/dev/null 2>&1; then
  printf '%s\n' 'Error: Claude usage auditing requires Node.js, but "node" was not found in PATH. Install an organisation-approved Node.js runtime and retry.' >&2
  exit 127
fi

if ! command -v npx >/dev/null 2>&1; then
  printf '%s\n' 'Error: Claude usage auditing requires npx, but "npx" was not found in PATH. Install an organisation-approved Node.js distribution that includes npm/npx and retry.' >&2
  exit 127
fi

script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd)
exec node "$script_dir/collect-usage.mjs" "$@"
