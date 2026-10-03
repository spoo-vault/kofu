<#
.SYNOPSIS
  Builds and deploys the POKA Escrow Soroban contract to Stellar Testnet.
.DESCRIPTION
  Requires Stellar CLI (stellar) or cargo with wasm32-unknown-unknown target.
#>

param(
  [string]$Network = "testnet",
  [string]$AdminKey = "alice",
  [string]$SentinelKey = "sentinel"
)

Write-Host "==> Building Soroban Escrow Contract (wasm32-unknown-unknown)..." -ForegroundColor Cyan
cargo build --target wasm32-unknown-unknown --release --manifest-path contracts/soroban-poka-escrow/Cargo.toml

$wasmPath = "contracts/soroban-poka-escrow/target/wasm32-unknown-unknown/release/soroban_poka_escrow.wasm"

if (Test-Path $wasmPath) {
  $fileSize = (Get-Item $wasmPath).Length
  Write-Host "==> Wasm binary ready: $wasmPath ($fileSize bytes)" -ForegroundColor Green
  Write-Host "==> To deploy using Stellar CLI:" -ForegroundColor Yellow
  Write-Host "    stellar contract deploy --wasm $wasmPath --source $AdminKey --network $Network" -ForegroundColor White
  Write-Host "==> Then initialize:" -ForegroundColor Yellow
  Write-Host "    stellar contract invoke --id <CONTRACT_ID> --source $AdminKey --network $Network -- initialize --admin <ADMIN_ADDRESS> --sentinel <SENTINEL_ADDRESS>" -ForegroundColor White
} else {
  Write-Host "Error: Wasm compilation failed. File not found at $wasmPath" -ForegroundColor Red
}
