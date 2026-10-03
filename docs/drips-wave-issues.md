# POKA — Drips Wave Maintainer Issues & Bounties

> This directory catalogs 15 curated issues ready to be posted for **Drips Wave** maintainers and contributors. Individual issue templates with full specifications are located in [`docs/issues/`](./issues/).

---

## 📋 Maintainer Issue Registry

| Issue ID | Title | Category | Difficulty | Target Component | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| [**ISSUE-01**](./issues/issue-01-soroban-ttl.md) | Automated Soroban Storage TTL Refresh Cron | Smart Contracts / Backend | Intermediate | `contracts/`, `server/` | Ready |
| [**ISSUE-02**](./issues/issue-02-github-oracle.md) | GitHub Webhook Condition Verifier Service | Oracles / Sentinel | Intermediate | `server/src/services/` | Ready |
| [**ISSUE-03**](./issues/issue-03-sep10-auth.md) | Stellar SEP-10 Web Authentication Integration | Security / Auth | Intermediate | `server/src/services/` | Ready |
| [**ISSUE-04**](./issues/issue-04-freighter-passkeys.md) | Freighter Passkey Session Keys for Agent Delegation | Frontend / Wallets | Advanced | `client/src/lib/` | Ready |
| [**ISSUE-05**](./issues/issue-05-multisig-dispute.md) | Multi-Sig Arbiter Resolution Contract | Smart Contracts | Advanced | `contracts/` | Ready |
| [**ISSUE-06**](./issues/issue-06-zk-email-oracle.md) | Zero-Knowledge Email Delivery Oracle (zk-Email) | Cryptography / Oracles | Advanced | `server/src/services/` | Ready |
| [**ISSUE-07**](./issues/issue-07-mcp-agent-server.md) | Model Context Protocol (MCP) Server for AI Agents | AI / Protocols | Intermediate | `server/` | Ready |
| [**ISSUE-08**](./issues/issue-08-postgres-migration.md) | PostgreSQL Storage Engine with Prisma ORM | Backend / Database | Good First Issue | `server/src/db/` | Ready |
| [**ISSUE-09**](./issues/issue-09-websocket-stream.md) | Real-time WebSocket Sentinel Telemetry Stream | Realtime / UI | Good First Issue | `server/`, `client/` | Ready |
| [**ISSUE-10**](./issues/issue-10-sep24-anchor.md) | Stellar Anchor Fiat On-Ramp Integration (SEP-24) | Stellar Rails | Intermediate | `client/`, `server/` | Ready |
| [**ISSUE-11**](./issues/issue-11-gas-benchmarking.md) | Soroban CPU & Memory Gas Benchmarking Suite | Smart Contracts / QA | Good First Issue | `contracts/` | Ready |
| [**ISSUE-12**](./issues/issue-12-property-fuzzing.md) | Automated Fuzzing & Invariant Testing with `cargo-fuzz` | Security / Testing | Advanced | `contracts/` | Ready |
| [**ISSUE-13**](./issues/issue-13-stellar-did.md) | Decentralized Agent Identity & Reputation Registry | Identity / Reputation | Intermediate | `contracts/`, `server/` | Ready |
| [**ISSUE-14**](./issues/issue-14-pwa-mobile-ui.md) | Progressive Web App (PWA) & Mobile UX Optimization | Frontend / Mobile | Good First Issue | `client/` | Ready |
| [**ISSUE-15**](./issues/issue-15-soroban-events-indexer.md) | Standalone Soroban Contract Event Indexer Daemon | Indexing / Infra | Intermediate | `server/` | Ready |

---

## 🚀 How to Create These Issues on GitHub

You can create these issues directly in your repository using the **GitHub CLI (`gh`)**:
```bash
# Example: Creating Issue 01
gh issue create \
  --title "[DRIPS-01]: Automated Soroban Storage TTL Refresh Cron" \
  --body-file docs/issues/issue-01-soroban-ttl.md \
  --label "drips-wave,soroban,intermediate"
```
Or copy and paste the contents of each file in [`docs/issues/`](./issues/) into the GitHub New Issue form.
