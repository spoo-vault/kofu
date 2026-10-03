# [DRIPS-08]: PostgreSQL Storage Engine with Prisma ORM

## Context & Problem
The MVP utilizes a file-backed JSON store (`kofu-db.json`), which works well for local testing and lightweight hackathon demos. For production scale with concurrent agent requests, KOFU needs a robust relational database with ACID transactions and migration tooling.

## Scope & Target Files
- Target files:
  - `server/prisma/schema.prisma` (Database schema)
  - `server/src/db/prisma-store.ts` (Prisma-backed implementation of DataStore)
  - `server/docker-compose.yml` (Local PostgreSQL container)

## Acceptance Criteria
- [ ] Define Prisma schema covering `Agreement`, `AgreementEvent`, `Transaction`, and `Agent`.
- [ ] Implement `PrismaStore` satisfying the storage interface.
- [ ] Add Docker Compose setup for local PostgreSQL development.
- [ ] Include automated migration script and database seeding.

## Bounty Weight
- **Difficulty**: Good First Issue
- **Category**: Backend / Database
- **Drips Allocation**: 120 Drips Points
