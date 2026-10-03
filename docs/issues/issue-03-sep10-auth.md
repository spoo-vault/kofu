# [DRIPS-03]: Stellar SEP-10 Web Authentication Integration

## Context & Problem
Currently, API requests to create and fund agreements are initiated via client-provided keys. To provide non-custodial cryptographic authentication matching Stellar ecosystem standards, KOFU should implement **SEP-10: Stellar Web Authentication**. This allows users and autonomous agents to prove ownership of their Stellar account via cryptographic challenge transactions before creating agreements or accessing private negotiation channels.

## Scope & Target Files
- Target files:
  - `server/src/services/stellar/sep10.ts` (New SEP-10 challenge generator and validator)
  - `server/src/routes/auth.ts` (Challenge generation and token exchange routes)
  - `client/src/lib/freighter.ts` (Signing SEP-10 challenge transactions with Freighter)

## Acceptance Criteria
- [ ] Implement `GET /api/auth/challenge` to generate a cryptographically valid SEP-10 challenge transaction for a given Stellar account.
- [ ] Implement `POST /api/auth/token` to verify client signature on the challenge and return a JWT access token.
- [ ] Add middleware to validate JWT on protected endpoints (`/api/agreements` creation).
- [ ] Update client Freighter integration to sign challenge transaction upon wallet connection.
- [ ] Add automated tests for challenge creation, signature validation, and replay protection (time-bounds checking).

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Security / Auth
- **Drips Allocation**: 180 Drips Points
