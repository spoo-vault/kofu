# [DRIPS-09]: Real-time WebSocket Sentinel Telemetry Stream

## Context & Problem
Currently, the client frontend polls the backend `/api/agreements/sentinel/status` every 4 seconds to update live activity. For high-frequency autonomous agent interactions and instant feedback, a full-duplex WebSocket or Server-Sent Events (SSE) feed should push ledger events directly to the UI.

## Scope & Target Files
- Target files:
  - `server/src/services/websocket/server.ts` (WS broadcast server)
  - `client/src/lib/use-sentinel-stream.ts` (React hook for real-time telemetry)
  - `client/src/components/StatusBar.tsx` (Live WebSocket indicator)

## Acceptance Criteria
- [ ] Implement WebSocket server using `ws` on top of the Express HTTP server.
- [ ] Broadcast new agreement events, deposits, condition triggers, and settlements in real time.
- [ ] Implement automatic reconnect logic in client React hook.
- [ ] Show real-time latency and connection heartbeat in the StatusBar.

## Bounty Weight
- **Difficulty**: Good First Issue
- **Category**: Realtime / UI
- **Drips Allocation**: 120 Drips Points
