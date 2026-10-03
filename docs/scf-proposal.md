# Stellar Community Fund (SCF) Build Award Proposal

## Project Information
* **Project Name**: KOFU (Programmable On-chain Knowledge Agreements)
* **Tagline**: Autonomous Economic Agreement Protocol on Stellar & Soroban
* **Category**: AI & Autonomous Agents / Payments & Escrow Infrastructure
* **Integration Track / Open Track**: Integration Track
* **Repository**: [https://github.com/spoo-vault/kofu](https://github.com/spoo-vault/kofu)
* **Demo URL**: [https://kofu-stellar.web.app](https://kofu-stellar.web.app)
* **Target Network**: Stellar Mainnet (via Soroban Smart Contracts)
* **Assets Supported**: Stellar Native XLM, Circle USDC, EURC

---

## 1. Product Readiness & Traction

### The Problem
In the modern digital economy—from freelance gigs and micro-bounties to emerging autonomous AI agent interactions—agreements are made using natural language:
> *"Pay 50 USDC when the website is delivered tomorrow."*
> *"Send 25 USDC once the research dataset is verified."*

However, traditional legal contracts are too slow and expensive for small and medium transactions ($10 – $1,000). Existing crypto escrows require technical knowledge of smart contract calls, ABI encoding, and manual dispute arbitration. As autonomous AI agents proliferate, they require a trustless, automated economic settlement layer to negotiate terms, lock funds, verify fulfillment, and settle value deterministically.

### The Solution: KOFU
KOFU bridges natural language human/agent communication and deterministic on-chain settlement:
1. **Natural Language Parser**: Parses intents into structured JSON agreements using Google Gemini 2.0 Flash with a high-accuracy deterministic fallback.
2. **Policy & Permission Guardrails**: Enforces velocity caps (e.g. 100 USDC single transaction max, 75 USDC autonomous negotiation threshold).
3. **Soroban Escrow Smart Contract**: Holds funds trustlessly in a high-efficiency Rust WebAssembly contract (`soroban-kofu-escrow`).
4. **KOFU Sentinel**: An autonomous monitoring daemon that watches completion signals and automatically triggers on-chain settlement without requiring manual human clicks.

### Verified Need & Ecosystem Traction
- **Working MVP**: A functional full-stack prototype is already live with native Soroban Rust smart contracts compiled and tested (`cargo test`), Node.js backend with `@stellar/stellar-sdk`, and React 18 client with Freighter wallet support.
- **Micro-Payment Viability**: Stellar is uniquely suited for KOFU because average transaction fees are fractions of a cent (< $0.0001), enabling micro-escrows ($5 to $50) that are impossible on Ethereum or Layer 2s due to gas costs.
- **Target Audience**: Freelancers, DAO bounty managers, AI agent developers (LangChain, AutoGen, CrewAI), and decentralized service marketplaces on Stellar.

---

## 2. Technical Architecture & Stellar Integration

### Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│               Natural Language Interface               │
│          (Web App, Chatbot, Agent API, MCP)            │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│            KOFU Agent Orchestration Layer              │
│  - Agreement Parser (Gemini 2.0 + Deterministic)       │
│  - Policy Engine (Velocity Caps & Spend Envelopes)     │
│  - Autonomous Agent Negotiator (SLA & Counter-offers)  │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│                 KOFU Sentinel Service                  │
│  - State Machine (DRAFT ➔ ESCROWED ➔ SETTLED)         │
│  - Off-chain Telemetry / Verification Oracles          │
│  - Automated Settlement Invocation                     │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│              Stellar & Soroban Layer                   │
│  - soroban-kofu-escrow (Rust Contract on Wasm)         │
│  - Stellar Horizon + Soroban RPC Server                │
│  - Asset Support (Native XLM, Circle USDC, EURC)       │
│  - Freighter Browser Wallet Integration                │
└────────────────────────────────────────────────────────┘
```

### How Stellar is Meaningfully Integrated
Stellar is not a superficial addon or storage layer; it is the **core settlement and security engine**:
1. **Soroban Smart Contract (`soroban-kofu-escrow`)**:
   - Manages escrow state, locking buyer tokens and enforcing conditions (`initialize`, `deposit`, `mark_condition_met`, `settle`, `refund`, `dispute`).
   - Leverages Soroban's native auth framework (`Address::require_auth`) and Time-To-Live (TTL) storage persistence.
2. **Stablecoin Payment Rails**:
   - Integrates native Circle USDC and EURC on Stellar, allowing real-world commercial contracts to settle without crypto volatility risk.
3. **Low-Fee Finality**:
   - Sub-second transaction finality ensures automated agents can close deals in real time with predictable, negligible costs.

---

## 3. Three-Tranche Milestone Plan & Budget

KOFU follows the official SCF Build Award 3-tranche structure with verifiable deliverables, timelines, and budgets:

### Tranche 1: Core Soroban MVP & Agent Parser
* **Target Duration**: Month 1 – 2
* **Budget**: $18,000 USD (in XLM)
* **Deliverables**:
  1. Complete Rust Soroban escrow smart contract (`soroban-kofu-escrow`) supporting token deposits, condition flags, release, and timeout refunds.
  2. 100% unit test coverage using `soroban-sdk` testutils with mock token clients.
  3. LLM Natural Language Agreement Parser supporting Gemini 2.0 and deterministic regex fallback for Stellar assets (XLM, USDC, EURC).
  4. Functional Web UI with command terminal, lifecycle stepper, and Freighter wallet connection.
* **Verification Criteria**:
  - Open source GitHub repository with passing `cargo test` command.
  - Live demo deployment connected to Stellar Testnet.
  - Testnet transaction hashes visible on StellarExpert.

### Tranche 2: Testnet Pilot, Oracle Verification & Threat Modeling
* **Target Duration**: Month 3 – 4
* **Budget**: $22,000 USD (in XLM)
* **Deliverables**:
  1. Integration of external verification oracles: GitHub webhook verifier (releases bounty on PR merge) and HTTP webhook verifier.
  2. Multi-agent negotiation protocol (Model Context Protocol / MCP endpoint) allowing external agents to negotiate terms autonomously.
  3. Comprehensive STRIDE Threat Model conforming to the official SDF Threat Modeling Readiness guide.
  4. On-Chain Monitoring Plan based on the SDF Builder Template tracking contract events, anomalies, and SLA breaches.
  5. Testnet pilot with 25 independent test users/agents creating and settling agreements.
* **Verification Criteria**:
  - Live GitHub action / webhook release demo on Stellar Testnet.
  - Published Threat Model (`docs/threat-model.md`) and Monitoring Plan (`docs/monitoring-plan.md`).
  - Public testnet ledger records showing at least 50 completed agreement lifecycles.

### Tranche 3: Mainnet Launch, Freighter Passkeys & Ecosystem Adoption
* **Target Duration**: Month 5 – 6
* **Budget**: $20,000 USD (in XLM)
* **Deliverables**:
  1. Mainnet Soroban smart contract audit and deployment.
  2. Support for Freighter Passkeys / WebAuthn session keys for seamless agent delegation without signing every micro-transaction.
  3. Fiat on/off-ramp integration via Stellar Anchors (SEP-24 / SEP-31) for frictionless funding.
  4. Public SDK (`@kofu/sdk`) for easy embedding into other Stellar ecosystem dApps.
* **Verification Criteria**:
  - Verified Soroban contract deployed on Stellar Mainnet.
  - Independent security audit report published.
  - Live Mainnet transaction volume satisfying the Final-Tranche Metric Commitment.

---

## 4. Final-Tranche Metric Commitment (Integration Track)

As required by the SCF Integration Track guidelines, KOFU commits to the following verifiable on-chain metrics:
* **Metric Type**: Cumulative payment and transaction escrow volume on Stellar Mainnet.
* **Proposed Threshold**:
  - **$25,000 USD equivalent** in cumulative volume settled through the KOFU Soroban Escrow contract.
  - **At least 150 unique completed economic agreements**.
* **Measurement Window**: Within 90 days following Mainnet deployment.
* **Registered On-Chain Footprint**:
  - Soroban Contract ID: Registered at award time.
  - Primary Sentinel Operator Public Key: Attributable on-chain signer.

---

## 5. Threat Model & Monitoring Readiness Summary
In accordance with SCF Build Award Tranche #2 requirements, KOFU has established:
* **STRIDE Threat Model**: Detailed in [docs/threat-model.md](./threat-model.md). Covers spoofing of Sentinel verification signals, prompt injection into the AI parser, replay attacks, and Soroban storage exhaustion.
* **On-Chain Monitoring Plan**: Detailed in [docs/monitoring-plan.md](./monitoring-plan.md). Covers real-time indexers for `(kofu, deposit)`, `(kofu, settled)`, and `(kofu, disputed)` events, with alerts for anomalous settlement volume or sudden spike in refunds.

---

## 6. Open Source Commitment
All KOFU smart contracts, SDKs, and backend services are released under the permissive **MIT License** and will remain 100% public goods for the Stellar developer community.
