# KOFU Product Roadmap

This roadmap outlines the development milestones for KOFU across the **Stellar Community Fund (SCF)** and **Drips Wave**.

---

## 📍 Phase 1: MVP & Soroban Core Escrow *(Completed / Current)*
- [x] Initial protocol architecture & natural language pipeline design
- [x] Dual-engine parser: Google Gemini 2.0 Flash + high-accuracy regex heuristics
- [x] Policy and spend velocity limits engine ($100 max tx, $75 auto-negotiation)
- [x] Rust Soroban smart contract (`contracts/soroban-kofu-escrow`) with deposit, verify, settle, refund, and dispute lifecycle
- [x] Automated unit test suite passing with `soroban-sdk` mock token clients
- [x] Compilation to optimized `wasm32-unknown-unknown` binary
- [x] Node.js backend integration with `@stellar/stellar-sdk` and Horizon/Soroban RPC
- [x] React 18 frontend with dark terminal design, lifecycle stepper, and Freighter wallet integration

---

## 📍 Phase 2: Testnet Pilot, Oracle Verifiers & Threat Model *(SCF Tranche 2)*
- [ ] **GitHub Webhook Oracle**: Automated condition verification triggered by GitHub PR merges or issue closures.
- [ ] **HTTP / REST API Oracle**: Generic HMAC-signed webhook verifier for web deliverable endpoints.
- [ ] **Model Context Protocol (MCP)**: Server exposing KOFU agreement tools to Anthropic Claude, AutoGen, and LangChain agents.
- [ ] **Dispute Resolution & Multi-Sig**: Implementation of multi-signature or community arbiter resolution for contested agreements.
- [ ] **PostgreSQL Storage Layer**: Production database replacing the local JSON datastore with real-time Prisma ORM migrations.
- [ ] **Testnet Pilot Deployment**: Live pilot with 25 independent test users and developer agents on Stellar Testnet.

---

## 📍 Phase 3: Mainnet Launch, Freighter Passkeys & Ecosystem Adoption *(SCF Tranche 3)*
- [ ] **Soroban Mainnet Deployment**: Formal smart contract audit and deployment to Stellar Mainnet.
- [ ] **Freighter Passkeys / WebAuthn**: Support for session keys allowing autonomous agents to transact within delegated budgets without manual popups.
- [ ] **Stellar Anchor Integration (SEP-24 / SEP-31)**: Seamless fiat on/off-ramp funding for commercial agreements.
- [ ] **TypeScript SDK (`@kofu/sdk`)**: Published npm package allowing any developer to embed KOFU natural language escrows into their apps.
- [ ] **On-Chain Metric Achievement**: Reach $25,000 cumulative volume and 150+ completed agreements on Stellar Mainnet.
