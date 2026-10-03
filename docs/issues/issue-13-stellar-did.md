# [DRIPS-13]: Decentralized Agent Identity & Reputation Registry

## Context & Problem
In an open multi-agent economy, buyer agents need to know the historical reliability and track record of counterparty seller agents before committing funds. Building an on-chain or verifiable credential reputation registry enables agents to accumulate trust scores based on successfully settled agreements without defaults or disputes.

## Scope & Target Files
- Target files:
  - `contracts/soroban-kofu-escrow/src/reputation.rs` (Reputation tracking submodule)
  - `server/src/routes/agents.ts` (Agent reputation queries and badges)
  - `client/src/pages/NegotiationPage.tsx` (Displaying agent credit score in negotiation feed)

## Acceptance Criteria
- [ ] Track successfully fulfilled agreements per counterparty address on Soroban.
- [ ] Calculate dynamic trust score: `Score = (Settled / Total) * 100` with volume weighting.
- [ ] Expose reputation endpoint `GET /api/agents/:address/reputation`.
- [ ] Display verified reputation badge in the frontend UI during agreement creation and negotiation.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Identity / Reputation
- **Drips Allocation**: 180 Drips Points
