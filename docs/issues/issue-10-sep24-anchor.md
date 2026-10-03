# [DRIPS-10]: Stellar Anchor Fiat On-Ramp Integration (SEP-24)

## Context & Problem
Many real-world users and businesses creating economic agreements hold traditional fiat currency (USD, EUR, NGN, BRL) rather than crypto assets. Integrating **SEP-24 (Hosted Deposit and Withdrawal)** allows users to fund Soroban escrows directly from their local bank account or debit card via regulated Stellar anchors.

## Scope & Target Files
- Target files:
  - `client/src/lib/anchor.ts` (SEP-24 anchor client helper)
  - `client/src/components/FiatOnrampModal.tsx` (Interactive deposit modal)
  - `server/src/services/stellar/anchor.ts` (Anchor discovery and TOML parser)

## Acceptance Criteria
- [ ] Parse `stellar.toml` for designated anchor (e.g. MoneyGram / Circle / Anclap).
- [ ] Initiate SEP-24 interactive deposit session for Stellar USDC.
- [ ] Display popup/iframe for user bank transfer or card payment.
- [ ] Automatically detect receipt of USDC and advance agreement to `ESCROWED`.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Stellar Rails
- **Drips Allocation**: 180 Drips Points
