# [DRIPS-11]: Soroban CPU & Memory Gas Benchmarking Suite

## Context & Problem
Soroban smart contracts incur fees based on CPU instructions, memory footprint, and ledger read/write bytes. To guarantee minimal fees and maximum throughput for micro-agreements, we need an automated benchmarking suite measuring gas consumption across all contract invocations (`deposit`, `mark_condition_met`, `settle`, `refund`).

## Scope & Target Files
- Target files:
  - `contracts/soroban-kofu-escrow/tests/benchmark.rs` (Gas benchmarking test)
  - `scripts/benchmark-gas.sh` (Automated report generator)

## Acceptance Criteria
- [ ] Measure CPU instruction counts for each contract entry point using `soroban-sdk` test budget metrics.
- [ ] Profile memory allocation footprint and persistent storage write sizes.
- [ ] Generate a markdown report comparing gas costs in stroops and USD for $10, $50, and $500 escrows.
- [ ] Set up CI regression check ensuring future PRs do not increase gas costs by > 5%.

## Bounty Weight
- **Difficulty**: Good First Issue
- **Category**: Smart Contracts / QA
- **Drips Allocation**: 100 Drips Points
