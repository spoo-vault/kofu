# [DRIPS-02]: GitHub Webhook Condition Verifier Service

## Context & Problem
Currently, condition verification in POKA can be triggered via simulated API endpoints (`/satisfy`). To make POKA genuinely autonomous for developer bounties and open-source milestones, we need an automated oracle service that listens to GitHub webhooks (e.g. `pull_request.closed` where `merged == true` or `issues.closed`).

## Scope & Target Files
- Target files:
  - `server/src/services/sentinel/oracles/github.ts` (New oracle service)
  - `server/src/routes/webhooks.ts` (New webhook endpoint)
  - `server/src/services/sentinel/monitor.ts` (Integration with Sentinel state machine)

## Acceptance Criteria
- [ ] Implement `POST /api/webhooks/github` endpoint with HMAC-SHA256 signature verification (`X-Hub-Signature-256`) using a shared secret.
- [ ] Parse repository, PR number, PR author, and merge status.
- [ ] Match PR merge event against active agreements where condition references the repository or PR URL.
- [ ] Generate a cryptographic SHA-256 proof hash of the GitHub payload (`proof_hash`).
- [ ] Invoke `SentinelService.verifyCondition(agreement)` passing the proof hash.
- [ ] Emits `CONDITION_VERIFIED` event with the GitHub commit SHA and PR author.
- [ ] Provide test suite with mock GitHub webhook payloads.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: Oracles / Sentinel
- **Drips Allocation**: 200 Drips Points
