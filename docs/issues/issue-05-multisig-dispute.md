# [DRIPS-05]: Multi-Sig Arbiter Resolution Contract

## Context & Problem
In `soroban-poka-escrow`, the `resolve_dispute` function currently accepts single-admin resolutions. To achieve full decentralization for contested agreements, we need an M-of-N multi-sig arbitration module or integration where a panel of designated community arbiters can vote on how to split disputed funds between buyer and seller.

## Scope & Target Files
- Target files:
  - `contracts/soroban-poka-escrow/src/lib.rs` (Arbiter quorum data structures)
  - `contracts/soroban-poka-escrow/src/test.rs` (Unit tests for dispute quorum voting)

## Acceptance Criteria
- [ ] Add an `Arbiters(Vec<Address>)` and `Threshold(u32)` configuration to contract storage.
- [ ] Implement `vote_dispute(env, agreement_id, proposed_buyer_share, proposed_seller_share)` callable by registered arbiters.
- [ ] Once the threshold of matching votes is reached, automatically release the agreed split and mark status as `Settled`.
- [ ] Prevent double-voting by the same arbiter on the same agreement.
- [ ] Write unit tests verifying: 2-of-3 arbiter consensus, rejection of unauthorized voters, and mismatched proposal handling.

## Bounty Weight
- **Difficulty**: Advanced
- **Category**: Smart Contracts / Governance
- **Drips Allocation**: 220 Drips Points
