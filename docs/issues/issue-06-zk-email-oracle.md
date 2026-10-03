# [DRIPS-06]: Zero-Knowledge Email Delivery Oracle (zk-Email)

## Context & Problem
Many freelance and real-world deliveries are verified via email notifications (e.g. DocuSign completion receipts, domain registrar confirmations, shipping tracking numbers). Integrating zero-knowledge email proofs (zk-email) allows the Sentinel to verify that a delivery confirmation email was signed by an authoritative DKIM domain without revealing the user's private email contents or PII.

## Scope & Target Files
- Target files:
  - `server/src/services/sentinel/oracles/zk-email.ts` (ZK email proof verifier)
  - `contracts/soroban-kofu-escrow/src/lib.rs` (Proof hash verification)

## Acceptance Criteria
- [ ] Implement DKIM signature parser and RSA-SHA256 header validator.
- [ ] Verify regex pattern matching within email body without leaking raw content.
- [ ] Export proof hash to `soroban-kofu-escrow` via `mark_condition_met`.
- [ ] Add sample fixture proving an invoice or delivery confirmation.

## Bounty Weight
- **Difficulty**: Advanced
- **Category**: Cryptography / Oracles
- **Drips Allocation**: 300 Drips Points
