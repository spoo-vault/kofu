# POKA — Make Promises Programmable

> **Autonomous Economic Agreement Protocol on Stellar & Soroban**

POKA turns natural-language promises and commitments into programmable economic agreements with autonomous monitoring and on-chain settlement on **Stellar** and **Soroban**.

---

## ⚡ The Golden Path Loop

```
Natural language instruction
        ↓
POKA understands intent & extracts terms (Gemini 2.0 / Heuristic fallback)
        ↓
Structured agreement generated with Policy Guardrails
        ↓
User reviews / Autonomous agent negotiates terms (Counter-offers & SLAs)
        ↓
Funds locked into Soroban Escrow (USDC / XLM / EURC)
        ↓
POKA Sentinel autonomously monitors condition & off-chain telemetry
        ↓
Condition satisfied & cryptographically verified
        ↓
Settlement executed on Stellar Soroban Testnet / Mainnet
        ↓
Verifiable on-chain transaction confirmed on StellarExpert
```

---

## 🏗️ Architecture

```
USER / AI AGENT
     ↓
POKA AGENT ORCHESTRATOR
     ↓
TOOLS (parseAgreement, negotiate, depositEscrow, verifyCondition, releasePayment)
     ↓
POLICY & PERMISSION LAYER (Limits, velocity caps, autonomous negotiation envelopes)
     ↓
POKA SENTINEL (Autonomous watcher & verification engine)
     ↓
STELLAR SETTLEMENT LAYER (Soroban Rust Escrow Contract + Stellar SDK + Horizon / Soroban RPC)
```

---

## 📦 Project Structure

```
poka/
├── contracts/
│   └── soroban-poka-escrow/      # Native Rust Soroban Smart Contract (soroban-sdk v22)
│       ├── Cargo.toml
│       └── src/
│           ├── lib.rs            # Escrow logic: initialize, deposit, verify, settle, refund, dispute
│           └── test.rs           # Automated unit tests with Mock token clients
├── server/                       # Node.js / Express backend with @stellar/stellar-sdk
│   └── src/
│       ├── services/
│       │   ├── stellar/          # Horizon client, Soroban RPC, Keypairs, Faucet, Escrow
│       │   ├── sentinel/         # Autonomous condition watcher & event ledger
│       │   └── ai/               # Intent parser (Gemini 2.0), Policy engine, Agent negotiator
│       └── routes/               # REST API for agreements, transactions, agents, and Stellar
├── client/                       # React 18 + Vite + Tailwind CSS frontend
│   └── src/
│       ├── lib/                  # API client & Freighter wallet integration
│       ├── components/           # Navbar, StatusBar, Policy badges
│       └── pages/                # Command terminal, Agreement detail, Negotiation, Activity
└── docs/                         # SCF Build Award proposal, Threat model, Monitoring plan, Issues
```

---

## 🚀 Running Locally

### Prerequisites
- Node.js v20+
- Rust & Cargo (with `wasm32-unknown-unknown` target)
- npm

### 1. Test Smart Contracts
```bash
npm run test:contracts
# Or directly:
cargo test --manifest-path contracts/soroban-poka-escrow/Cargo.toml
```

### 2. Start Backend Server
```bash
cd server
npm run dev
# Starts on port 3005 with Horizon & Soroban RPC configured
```

### 3. Start Frontend Client
```bash
cd client
npm run dev
# Serves on http://localhost:5173 with Freighter wallet support
```

---

## 🌐 Configuration (`server/.env`)

```env
PORT=3005
DEMO_MODE=true

# Stellar Network Settings
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"

# POKA Soroban Contract
STELLAR_CONTRACT_ID=CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
STELLAR_ADMIN_PUBLIC_KEY=GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5

# AI Parser (Optional)
GEMINI_API_KEY=
```

---

## 🛡️ Stellar Community Fund (SCF) & Security Standards
- **SCF Build Award Proposal**: [docs/scf-proposal.md](file:///c:/Users/HP/bitsgo/poka/docs/scf-proposal.md)
- **STRIDE Threat Model**: [docs/threat-model.md](file:///c:/Users/HP/bitsgo/poka/docs/threat-model.md)
- **On-Chain Monitoring Plan**: [docs/monitoring-plan.md](file:///c:/Users/HP/bitsgo/poka/docs/monitoring-plan.md)
- **Drips Wave Maintainer Issues**: [docs/drips-wave-issues.md](file:///c:/Users/HP/bitsgo/poka/docs/drips-wave-issues.md)
