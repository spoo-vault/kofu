# KOFU — On-Chain Monitoring Plan (Builders Template)

> Prepared in compliance with the **SDF On-Chain Monitoring Plan Template for Builders** on Stellar and Soroban.

---

## 1. System Scope & Monitored Infrastructure

### 1.1. Core Smart Contracts
* **Contract Name**: `soroban-kofu-escrow`
* **Network**: Stellar Testnet & Mainnet
* **Soroban Contract ID**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
* **Admin Address**: `GBZH7K5V6GZ6F5OXZXU7F5K7D2Z5H7A6C3Q7K2V5N6M8B4V2C1X3Z4A5`

### 1.2. Off-Chain Components
* **KOFU Sentinel Daemon**: Watches Stellar ledger events, parses external fulfillment signals, and signs settlements.
* **Stellar Horizon / Soroban RPC Stream**: Ingestion endpoint for contract events and ledger transaction feeds.

---

## 2. On-Chain Event Emissions Specification

The `soroban-kofu-escrow` smart contract emits structured events for every critical lifecycle transition. All events are indexed by the Sentinel daemon and public blockchain explorers:

| Event Type | Topic 0 | Topic 1 | Data Payload | Purpose / Observability |
| :--- | :--- | :--- | :--- | :--- |
| **Deposit** | `symbol_short!("kofu")` | `symbol_short!("deposit")` | `(agreement_id, buyer, seller, amount)` | Track capital inflows, active agreement count, and buyer addresses. |
| **Condition Met** | `symbol_short!("kofu")` | `symbol_short!("cond_met")` | `(agreement_id, proof_hash)` | Verifies off-chain condition verification before settlement. |
| **Settled** | `symbol_short!("kofu")` | `symbol_short!("settled")` | `(agreement_id, seller, amount)` | Track capital outflows to sellers and successful contract resolutions. |
| **Refunded** | `symbol_short!("kofu")` | `symbol_short!("refunded")` | `(agreement_id, buyer, amount)` | Monitor failed deliveries, timeouts, or Sentinel cancellations. |
| **Disputed** | `symbol_short!("kofu")` | `symbol_short!("disputed")` | `(agreement_id, caller)` | Trigger immediate human / arbiter notification for contested escrows. |
| **Resolved** | `symbol_short!("kofu")` | `symbol_short!("resolved")` | `(agreement_id, buyer_payout, seller_payout)` | Track dispute resolution payouts and split ratios. |

---

## 3. Metrics, Baselines & Anomaly Thresholds

| Metric Name | Normal Operating Range | Warning Threshold | Critical Alert Threshold | Monitoring Action |
| :--- | :--- | :--- | :--- | :--- |
| **Deposit Velocity** | 1 – 20 deposits / hour | > 50 deposits / hour | > 100 deposits / hour | Sentinel pauses auto-negotiations; flags possible sybil spam. |
| **Single Settlement Size** | 5 – 100 USDC | > 250 USDC | > 1,000 USDC | Triggers manual admin authorization requirement. |
| **Refund Rate** | < 5% of total agreements | > 15% in 24 hours | > 30% in 24 hours | Inspect seller agents for systemic failure or oracle delivery breakdown. |
| **Dispute Rate** | < 2% of total agreements | > 5% in 24 hours | > 10% in 24 hours | Immediate alert to dispute mediation team. |
| **Failed Transaction Calls** | < 1% error rate | > 5% error rate | > 15% error rate | Check for RPC degradation, auth signature failures, or sequence mismatches. |
| **Storage TTL Buffer** | > 40,000 ledgers remaining | < 20,000 ledgers | < 5,000 ledgers | Automated Sentinel background job calls `extend_ttl` immediately. |

---

## 4. Alerting & Notification Pipeline

```
[ Stellar Soroban Contract Events ]
               │
               ▼
[ Soroban RPC Event Poller / Ingestion Service ]
               │
               ▼
┌──────────────────────────────────────────────┐
│           KOFU Anomaly Detection Engine      │
│  - Threshold Checker                         │
│  - Heartbeat Watchdog                        │
│  - Failure Counter                           │
└──────────────────────┬───────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         ▼                           ▼
[ Discord / Slack Webhook ]   [ PagerDuty Alert ]
   (Info & Warnings)          (Critical & Security)
```

### Alert Channels
1. **P1 — Critical (PagerDuty & SMS)**:
   - Unauthorized settlement invocation attempt.
   - Any single transaction > $1,000 without multi-sig signoff.
   - Soroban RPC unreachable for > 3 consecutive minutes.
2. **P2 — Warning (Discord / Slack Security Channel)**:
   - Refund rate exceeds 15% over a 24-hour window.
   - Sentinel wallet balance drops below 50 XLM (approaching fee depletion).
   - Storage TTL within 20,000 ledgers of expiration.
3. **P3 — Informational (Telegram / Dashboard Feed)**:
   - Normal agreement lifecycle completions (`deposit`, `settled`).
   - Daily active agreements count and volume summaries.

---

## 5. Incident Response Playbooks

### Playbook A: Sentinel Key Compromise or Malfunction
1. **Immediate Step**: Admin account calls contract update or revokes Sentinel role via admin key:
   `KofuEscrowContract::update_sentinel(&env, &new_sentinel_address)`.
2. **Isolation**: Stop the off-chain Sentinel Node process to prevent automated malicious transactions.
3. **Audit**: Review all transactions signed within the preceding 6 hours against off-chain verification logs.
4. **Resolution**: Deploy new rotated keypair funded via cold storage and resume Sentinel monitoring.

### Playbook B: Abnormal Spike in Disputes
1. **Immediate Step**: Sentinel automatically downgrades agreement creation autonomy level from `AUTONOMOUS` to `MANUAL` approval.
2. **Inspection**: Verify if external oracle (e.g. GitHub API, deliverable endpoint) is experiencing outages or false negatives.
3. **Resolution**: Once oracle health is verified, manually review contested escrow items and resume autonomous operations.

### Playbook C: Persistent Storage TTL Low-Water Mark
1. **Immediate Step**: Run automated recovery script:
   `npm run maintenance:extend-ttl`.
2. **Verification**: Confirm on StellarExpert that the contract and persistent instance storage TTL have been restored to 100,000 ledgers.
