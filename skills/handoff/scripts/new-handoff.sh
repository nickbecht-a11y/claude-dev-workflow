#!/usr/bin/env bash
# Creates a timestamped handoff file and prints its path.
set -euo pipefail
# repo-root handoffs/ per CLAUDE.md output folders
dir="$(git rev-parse --show-toplevel)/handoffs"
mkdir -p "$dir"
file="$dir/$(date +%Y-%m-%dT%H-%M-%S).md"
touch "$file"
echo "$file"
