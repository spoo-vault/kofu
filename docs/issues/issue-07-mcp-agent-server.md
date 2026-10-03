# [DRIPS-07]: Model Context Protocol (MCP) Server for AI Agents

## Context & Problem
To enable AI agents running in external ecosystems (Claude Desktop, AutoGen, CrewAI, LangChain) to use KOFU as their default payment and escrow tool, KOFU should expose a standardized **Model Context Protocol (MCP)** server over standard I/O and Server-Sent Events (SSE).

## Scope & Target Files
- Target files:
  - `server/src/services/mcp/server.ts` (MCP Server implementation)
  - `server/src/services/mcp/tools.ts` (Tool definitions for parse, deposit, status)

## Acceptance Criteria
- [ ] Expose MCP tools: `create_agreement`, `fund_escrow`, `check_agreement_status`, and `verify_condition`.
- [ ] Conforms to the official MCP specification using `@modelcontextprotocol/sdk`.
- [ ] Add JSON schema validation for all tool inputs.
- [ ] Provide example configuration for Claude Desktop and Cursor.

## Bounty Weight
- **Difficulty**: Intermediate
- **Category**: AI / Protocols
- **Drips Allocation**: 200 Drips Points
