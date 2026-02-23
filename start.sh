#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Nix környezet betöltése (Railway Nixpacks)
[ -f /root/.nix-profile/etc/profile.d/nix.sh ] && . /root/.nix-profile/etc/profile.d/nix.sh
export PATH="/root/.nix-profile/bin:/nix/var/nix/profiles/default/bin:/usr/local/bin:/usr/bin:$PATH"

# Python: venv használata, ha létezik (lokálisan FastAPI miatt)
if [ -n "$PROJECT1_VENV" ] && [ -x "$PROJECT1_VENV/bin/python" ]; then
  PYTHON_CMD="$PROJECT1_VENV/bin/python"
elif [ -x "$HOME/project1-venv/bin/python" ]; then
  PYTHON_CMD="$HOME/project1-venv/bin/python"
elif [ -x "$SCRIPT_DIR/venv/bin/python" ]; then
  PYTHON_CMD="$SCRIPT_DIR/venv/bin/python"
elif [ -x "$SCRIPT_DIR/.venv/bin/python" ]; then
  PYTHON_CMD="$SCRIPT_DIR/.venv/bin/python"
else
  PYTHON_CMD=python3
fi

# Backend belső porton (a Node proxy felé)
"$PYTHON_CMD" -m uvicorn server:app --host 0.0.0.0 --port 8000 &

# Frontend (a $PORT-on listenel – Railway erre irányít)
export API_BACKEND=http://127.0.0.1:8000
exec node scripts/serve.js
