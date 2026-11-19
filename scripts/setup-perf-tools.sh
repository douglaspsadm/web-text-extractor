#!/usr/bin/env bash
set -euo pipefail

export PATH="$HOME/.local/bin:$PATH"
mkdir -p "$HOME/.local/bin"

if ! command -v rtk >/dev/null 2>&1; then
  echo "[perf-stack] Installing rtk..."
  ARCH="$(uname -m)"
  if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
    PKG="rtk-aarch64-unknown-linux-musl.tar.gz"
  else
    PKG="rtk-x86_64-unknown-linux-musl.tar.gz"
  fi
  TMP_DIR="$(mktemp -d)"
  gh release download -R rtk-ai/rtk -p "$PKG" -D "$TMP_DIR" --clobber
  tar -xzf "$TMP_DIR/$PKG" -C "$TMP_DIR"
  mv "$TMP_DIR/rtk" "$HOME/.local/bin/rtk"
  chmod +x "$HOME/.local/bin/rtk"
  rm -rf "$TMP_DIR"
fi

if ! command -v graphify >/dev/null 2>&1; then
  echo "[perf-stack] Installing graphify..."
  uv tool install "graphifyy" >/dev/null
fi

if ! command -v context-mode >/dev/null 2>&1; then
  echo "[perf-stack] Installing context-mode..."
  npm install -g --prefix "$HOME/.local" context-mode >/dev/null
fi

if ! command -v headroom >/dev/null 2>&1; then
  echo "[perf-stack] Installing headroom-ai..."
  uv tool install "headroom-ai" >/dev/null
fi

if [ ! -f "graphify-out/graph.json" ] && command -v graphify >/dev/null 2>&1; then
  echo "[perf-stack] Building codebase graph (graphify-out/graph.json)..."
  graphify extract . >/dev/null 2>&1 || true
fi

echo "[perf-stack] Ready: rtk=$(rtk --version 2>/dev/null || echo missing), graphify=$(command -v graphify || echo missing), context-mode=$(command -v context-mode || echo missing), headroom=$(headroom --version 2>/dev/null | head -n1 || echo missing)"
