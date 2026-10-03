/**
 * POKA Drips Wave - GitHub Issues Bulk Creator
 * Run: node scripts/create-github-issues.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const issuesDir = path.resolve(__dirname, '../docs/issues');

const issueConfigs = [
  { file: 'issue-01-soroban-ttl.md', title: '[DRIPS-01]: Automated Soroban Storage TTL Refresh Cron', labels: 'drips-wave,soroban,intermediate' },
  { file: 'issue-02-github-oracle.md', title: '[DRIPS-02]: GitHub Webhook Condition Verifier Service', labels: 'drips-wave,oracles,intermediate' },
  { file: 'issue-03-sep10-auth.md', title: '[DRIPS-03]: Stellar SEP-10 Web Authentication Integration', labels: 'drips-wave,security,auth,intermediate' },
  { file: 'issue-04-freighter-passkeys.md', title: '[DRIPS-04]: Freighter Passkey Session Keys for Agent Delegation', labels: 'drips-wave,wallets,passkeys,advanced' },
  { file: 'issue-05-multisig-dispute.md', title: '[DRIPS-05]: Multi-Sig Arbiter Resolution Contract', labels: 'drips-wave,soroban,governance,advanced' },
  { file: 'issue-06-zk-email-oracle.md', title: '[DRIPS-06]: Zero-Knowledge Email Delivery Oracle (zk-Email)', labels: 'drips-wave,cryptography,advanced' },
  { file: 'issue-07-mcp-agent-server.md', title: '[DRIPS-07]: Model Context Protocol (MCP) Server for AI Agents', labels: 'drips-wave,ai,protocols,intermediate' },
  { file: 'issue-08-postgres-migration.md', title: '[DRIPS-08]: PostgreSQL Storage Engine with Prisma ORM', labels: 'drips-wave,database,good-first-issue' },
  { file: 'issue-09-websocket-stream.md', title: '[DRIPS-09]: Real-time WebSocket Sentinel Telemetry Stream', labels: 'drips-wave,realtime,good-first-issue' },
  { file: 'issue-10-sep24-anchor.md', title: '[DRIPS-10]: Stellar Anchor Fiat On-Ramp Integration (SEP-24)', labels: 'drips-wave,stellar-rails,intermediate' },
  { file: 'issue-11-gas-benchmarking.md', title: '[DRIPS-11]: Soroban CPU & Memory Gas Benchmarking Suite', labels: 'drips-wave,qa,benchmarks,good-first-issue' },
  { file: 'issue-12-property-fuzzing.md', title: '[DRIPS-12]: Automated Fuzzing & Invariant Testing with cargo-fuzz', labels: 'drips-wave,security,testing,advanced' },
  { file: 'issue-13-stellar-did.md', title: '[DRIPS-13]: Decentralized Agent Identity & Reputation Registry', labels: 'drips-wave,identity,reputation,intermediate' },
  { file: 'issue-14-pwa-mobile-ui.md', title: '[DRIPS-14]: Progressive Web App (PWA) & Mobile UX Optimization', labels: 'drips-wave,mobile,frontend,good-first-issue' },
  { file: 'issue-15-soroban-events-indexer.md', title: '[DRIPS-15]: Standalone Soroban Contract Event Indexer Daemon', labels: 'drips-wave,indexing,infrastructure,intermediate' },
];

console.log('--- POKA DRIPS WAVE ISSUE GENERATOR ---');
console.log(`Found ${issueConfigs.length} configured maintainer tasks.\n`);

for (const cfg of issueConfigs) {
  const filePath = path.join(issuesDir, cfg.file);
  if (!fs.existsSync(filePath)) {
    console.warn(`[SKIP] Missing file: ${cfg.file}`);
    continue;
  }

  console.log(`[READY] ${cfg.title}`);
  console.log(`        File: ${cfg.file}`);
  console.log(`        Labels: ${cfg.labels}`);
  console.log(`        Command: gh issue create --title "${cfg.title}" --body-file "${filePath}" --label "${cfg.labels}"\n`);
}

console.log('To post all issues to your GitHub repository in one click, ensure GitHub CLI is logged in:');
console.log('  gh auth login');
console.log('Then run:');
console.log('  node scripts/create-github-issues.js --submit');
