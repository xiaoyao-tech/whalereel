#!/usr/bin/env bash
set -euo pipefail

# WhaleReel installer for DeepSeek Harness.
#
# Usage:
#   bash scripts/install-harness.sh                 # $DSH_HOME/skills/whalereel (default ~/.dsh/skills)
#   bash scripts/install-harness.sh .dsh/skills     # project-level
#   bash scripts/install-harness.sh /custom/skills  # custom skill root
#
# DSH discovers skills at:
#   <project>/.dsh/skills        (rank 100)
#   <project>/.agents/skills     (rank 200)
#   ~/.dsh/skills                (rank 400)
#   ~/.agents/skills             (rank 500)
#
# The skill directory must contain SKILL.md directly:
#   ~/.dsh/skills/whalereel/SKILL.md

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DSH_HOME="${DSH_HOME:-$HOME/.dsh}"
TARGET_BASE="${1:-$DSH_HOME/skills}"
TARGET="$TARGET_BASE/whalereel"

if [ -e "$TARGET" ]; then
  echo "Already exists: $TARGET"
  echo "Remove it first, or pass a different target base."
  echo "Example: bash scripts/install-harness.sh .dsh/skills"
  exit 1
fi

mkdir -p "$TARGET"

# Skill essentials only: no node_modules, renders, site, or sample mp4s.
cp "$ROOT/SKILL.md" "$TARGET/"
cp "$ROOT/PROMPTS.md" "$TARGET/"
cp "$ROOT/INSTALL.md" "$TARGET/" 2>/dev/null || true
cp "$ROOT/index.json" "$TARGET/"
cp "$ROOT/LICENSE" "$TARGET/" 2>/dev/null || true
cp "$ROOT/CREDITS.md" "$TARGET/" 2>/dev/null || true
cp -R "$ROOT/styles" "$TARGET/"
cp -R "$ROOT/templates" "$TARGET/"
cp -R "$ROOT/examples" "$TARGET/"
cp -R "$ROOT/render" "$TARGET/"
cp "$ROOT/package.json" "$TARGET/" 2>/dev/null || true
cp -R "$ROOT/scripts" "$TARGET/" 2>/dev/null || true

echo "Installed: $TARGET"
echo
echo "Next:"
echo "  1. Open a new DeepSeek Harness session."
echo "  2. Paste this prompt:"
echo
echo "     用 whalereel 做一条潭柘寺的景区介绍，45 秒，16:9，用立体纸雕风格。"
echo
echo "  3. The agent reads SKILL.md + styles/paper-diorama/STYLE.md,"
echo "     writes the scene, and renders with Chrome + ffmpeg."
echo
echo "More prompts: $TARGET/PROMPTS.md"
echo
echo "Render deps: cd $TARGET && npm i playwright; ffmpeg + local Chrome (or: npx playwright install chromium)"
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "warning: ffmpeg not found in PATH"
fi
