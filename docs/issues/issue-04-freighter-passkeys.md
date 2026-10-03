# [DRIPS-04]: Freighter Passkey Session Keys for Agent Delegation

## Context & Problem
Autonomous AI agents need to negotiate and lock micro-escrows without prompting the human user for a wallet signature on every micro-deal ($2 - $10). By implementing session keys and WebAuthn Passkey authorization, users can grant their delegated POKA agent a bounded spending allowance (e.g. $50 total or 24-hour validity) using Passkeys.

## Scope & Target Files
- Target files:
  - `client/src/lib/session-keys.ts` (Passkey registration and ephemeral key management)
  - `client/src/components/DelegationModal.tsx` (UI for configuring spending allowance)
  - `server/src/services/ai/policy.ts` (Validating delegated session key limits)

## Acceptance Criteria
- [ ] Create Passkey session key generator using WebAuthn browser APIs or Freighter Passkey support.
- [ ] User can configure: Maximum total spend (e.g. 50 USDC), expiration duration (e.g. 24 hours), and allowed counterparties.
- [ ] Sign ephemeral agent key authorization with master Stellar account.
- [ ] Agent signs autonomous micro-escrow deposits using the ephemeral key.
- [ ] UI shows active delegation status, remaining budget, and an instant "Revoke Delegation" button.

## Bounty Weight
- **Difficulty**: Advanced
- **Category**: Frontend / Wallets / WebAuthn
- **Drips Allocation**: 250 Drips Points
