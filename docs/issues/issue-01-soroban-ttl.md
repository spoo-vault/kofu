# [DRIPS-01]: Automated Soroban Storage TTL Refresh Cron

## Context & Problem
Soroban uses a state archival model where contract instance and persistent storage keys have an associated Time-To-Live (TTL). If an agreement has a long delivery window (e.g. 30 days) and nobody interacts with the contract, its persistent storage entry risks being archived. While the contract currently calls `extend_ttl` during state transitions, a background maintenance worker is required to proactively refresh live agreements approaching their low-water mark.

## Scope & Target Files
- Target files:
  - `server/src/services/stellar/ttl-manager.ts` (New service)
  - `server/src/services/stellar/escrow.ts` (Soroban TTL extension invocation)
  - `contracts/soroban-kofu-escrow/src/lib.rs` (Extend TTL helper method)

## Acceptance Criteria
- [ ] Create a scheduled background cron or worker in `server/src/services/stellar/ttl-manager.ts` that runs every 6 hours.
- [ ] Queries all active agreements (`ESCROWED`, `MONITORING`, `CONDITION_MET`).
- [ ] Checks remaining ledger TTL via Soroban RPC `getLedgerEntries`.
- [ ] Automatically submits a Soroban `extend_ttl` transaction if remaining TTL is below 20,000 ledgers.
- [ ] Emits a Sentinel activity log event when a TTL is extended.
- [ ] Add unit test verifying the TTL calculation logic.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Smart Contracts / Backend
- **Drips Allocation**: 150 Drips Points
