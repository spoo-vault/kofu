# Contributing to KOFU

Thank you for your interest in contributing to **KOFU — Autonomous Economic Agreement Protocol on Stellar & Soroban**! We welcome contributions from developers, researchers, and maintainers across the Stellar and AI communities.

KOFU is participating in **Drips Wave** and the **Stellar Community Fund (SCF)** to reward open source maintainers and contributors.

---

## 🛠️ Development Setup

### Prerequisites
* **Node.js**: v20 or higher
* **Rust & Cargo**: v1.75+ with WebAssembly target:
  ```bash
  rustup target add wasm32-unknown-unknown
  ```
* **Git**: Installed and configured

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/spoo-vault/kofu.git
cd kofu
npm run install:all
```

### 2. Run Smart Contract Tests
```bash
npm run test:contracts
# Or directly:
cargo test --manifest-path contracts/soroban-kofu-escrow/Cargo.toml
```

### 3. Run Development Servers
```bash
# Terminal 1: Backend Server (Port 3005)
npm run dev:server

# Terminal 2: Frontend Client (Port 5173 - Landing Page Preview)
npm run dev:client
```

---

## 🌊 Drips Wave & Bounty Issues

We maintain a curated set of maintainer tasks specifically designed for **Drips Wave**:
- Check [docs/drips-wave-issues.md](./docs/drips-wave-issues.md) for current open tasks.
- Ready-to-use issue templates are located in [docs/issues/](./docs/issues/).
- Tasks are categorized by difficulty (`good first issue`, `intermediate`, `advanced`) with corresponding Drips allocation weights.

---

## 📐 Coding Standards & Guidelines

1. **Smart Contracts (`contracts/soroban-kofu-escrow`)**:
   - Must compile with `soroban-sdk` without warnings.
   - All public contract functions must enforce `require_auth` on caller addresses.
   - Every state-modifying function must emit structured events.
   - Include unit tests in `src/test.rs` covering both happy and failure paths.

2. **Backend Server (`server/`)**:
   - Written in TypeScript (ES Modules).
   - Use `@stellar/stellar-sdk` for all blockchain interactions.
   - Respect policy guardrails in `src/services/ai/policy.ts`.

3. **Frontend Client (`client/`)**:
   - React 18 with Vite and Tailwind CSS.
   - Follow the dark technical terminal aesthetic (`#08080A`, `#00FF66`).
   - Use Freighter wallet for user signing.

---

## 🚀 Pull Request Workflow

1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with conventional commit messages:
   - `feat(...)`: New feature or capability
   - `fix(...)`: Bug fix
   - `docs(...)`: Documentation updates
   - `test(...)`: Adding or updating tests
3. Ensure all tests and builds pass:
   ```bash
   npm run test:contracts
   npm run build:server
   npm run build:client
   ```
4. Push to your fork and submit a Pull Request referencing the corresponding Drips Issue ID.
