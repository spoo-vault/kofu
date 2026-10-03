#!/usr/bin/env bash
set -euo pipefail

# KOFU Soroban Contract Build & Deploy Script
NETWORK=${1:-testnet}
ADMIN_KEY=${2:-alice}

echo "==> Building Soroban Escrow Contract (wasm32-unknown-unknown)..."
cargo build --target wasm32-unknown-unknown --release --manifest-path contracts/soroban-kofu-escrow/Cargo.toml

WASM_PATH="contracts/soroban-kofu-escrow/target/wasm32-unknown-unknown/release/soroban_kofu_escrow.wasm"

if [ -f "$WASM_PATH" ]; then
  echo "==> Wasm binary ready: $WASM_PATH ($(wc -c < "$WASM_PATH") bytes)"
  echo "==> Deploy command:"
  echo "    stellar contract deploy --wasm $WASM_PATH --source $ADMIN_KEY --network $NETWORK"
else
  echo "Error: Wasm compilation failed. File not found at $WASM_PATH"
  exit 1
fi
