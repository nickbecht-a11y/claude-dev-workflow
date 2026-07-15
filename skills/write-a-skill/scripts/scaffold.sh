#!/usr/bin/env bash
# Usage: scaffold.sh <skill-name>
# Creates .agents/skills/<skill-name>/SKILL.md with the standard template.
set -euo pipefail

SKILL_NAME="${1:?Usage: scaffold.sh <skill-name>}"
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
SKILL_DIR="$ROOT/.agents/skills/$SKILL_NAME"

if [ -d "$SKILL_DIR" ]; then
  echo "Error: $SKILL_DIR already exists." >&2
  exit 1
fi

mkdir -p "$SKILL_DIR/scripts"

cat > "$SKILL_DIR/SKILL.md" <<EOF
---
name: $SKILL_NAME
description: Brief description. Use when [specific triggers].
---

# ${SKILL_NAME^}

## Quick start

[Minimal working example]

## Workflows

[Step-by-step processes]

## Advanced features

[Link to REFERENCE.md if needed]
EOF

echo "$SKILL_DIR/SKILL.md"
