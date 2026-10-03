# [DRIPS-15]: Standalone Soroban Contract Event Indexer Daemon

## Context & Problem
To maintain an immutable, high-performance audit ledger of every deposit, condition satisfaction, settlement, and refund without placing query load on public Soroban RPC nodes, we need a dedicated background indexer daemon that ingests contract events and indexes them into SQLite or PostgreSQL.

## Scope & Target Files
- Target files:
  - `server/src/services/stellar/indexer.ts` (Event polling and ledger ingestion daemon)
  - `server/src/routes/transactions.ts` (Exposing indexed historical queries)

## Acceptance Criteria
- [ ] Connects to Soroban RPC `getEvents` with paging tokens starting from contract deployment ledger.
- [ ] Filters topics `kofu:deposit`, `kofu:cond_met`, `kofu:settled`, `kofu:refunded`, `kofu:disputed`.
- [ ] Decodes XDR data structures into typed TypeScript JSON records.
- [ ] Automatically resumes from last saved ledger sequence upon service restart.
- [ ] Includes CLI command: `npm run indexer:sync`.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Indexing / Infrastructure
- **Drips Allocation**: 170 Drips Points
