# energy-portfolio-slice

A compact vertical slice that shows how to design and ship a real product feature, end to end:

- Frontend: React + TypeScript
- API: GraphQL first, with a small REST mirror
- Backend style: serverless-friendly Node
- Storage: DynamoDB-style data model (local or in-memory)
- Cross-cutting: validation, typed errors, auth, pagination, basic observability hooks

The codebase is structured to be readable in under 10 minutes and deep enough to show senior / staff-track thinking.

---

## Goals

1. Model a realistic domain: Customers, Projects, Energy Assets.
2. Expose a clean API for that domain.
3. Show how the frontend consumes it.
4. Make tradeoffs explicit: simplicity, evolvability, and testability.

This is not framework cosplay. It is a focused sample you can run, read, and extend.

---

## Domain

Entities

- Customer
- Project
- EnergyAsset

Relations

- Customer 1..n Project
- Project 1..n EnergyAsset

Common use case

- List customers.
- Drill into projects for a customer.
- Drill into assets for a project.
- Filter by project status.
- Filter by asset type.
- Use cursor-based pagination for projects and assets.

---

## Stack

Frontend

- React
- TypeScript
- Vite
- Apollo Client (or simple fetch, depending on final wiring)

API

- GraphQL schema and resolvers in TypeScript
- One REST endpoint that mirrors a GraphQL query
- Lambda-style handler interface so it can run in serverless or Node

Storage

- DynamoDB-style tables for Customers, Projects, EnergyAssets
- DynamoDB Local via Docker for realistic queries
- Simple repository layer so storage can be swapped with in-memory for demos

Cross-cutting

- API key auth with three roles: admin, user, readonly
- Error taxonomy:
    - DOMAIN_ERROR
    - AUTH_ERROR
    - VALIDATION_ERROR
    - NOT_FOUND
    - SYSTEM_ERROR
- Shared error mapping for GraphQL and REST
- Cursor-based pagination helpers
- Dataloader-style batching to avoid N+1 on nested lookups
- Structured logging with trace ids for request correlation

Testing

- Vitest workspace
- Targeted tests for:
    - pagination and cursors
    - filters
    - auth and role checks
    - error mapping

---

## Project structure

High level

- packages/domain  
  Pure domain types, factories, validation.

- packages/shared  
  Cross-cutting utilities: errors, auth, pagination, logging, dataloaders.

- services/api  
  GraphQL schema and resolvers, REST handler, data access, tests.

- frontend  
  Minimal React app that talks to the GraphQL API and renders the slice.

- local  
  DynamoDB Local and seed script (for when you want realistic data).

The layout is compatible with microfrontend and multi-service growth, without forcing it in a sample repo.

---

## Running locally

Once the remaining scripts are wired, the intended flow is:

1. Install dependencies

   `pnpm install`

2. Start DynamoDB Local (optional; in-memory fallback can also be used)

   `docker compose -f local/docker-compose.dynamodb.yml up -d`

3. Seed sample data

   `pnpm seed`  
   Options: `pnpm seed --recreate` to drop and recreate tables first.

4. Start backend and frontend

   `pnpm dev`

   Expected:

    - GraphQL: http://localhost:4000/graphql
    - REST: http://localhost:4000/rest
    - Frontend: http://localhost:5173

5. Run tests

   `pnpm test`

   Should cover shared utilities and core API behavior.

If a cloud provider is added later, the handlers are already structured for that.

---

## Example interactions

GraphQL

- List customers with nested projects and assets.
- Paginate projects with `first` and `after`.
- Filter projects by status.
- Filter energy assets by type.
- Call an `activateEnergyAsset` style mutation (stubbed) that:
    - validates input
    - updates asset state
    - logs an activation event with a trace id

REST

- One mirror endpoint for listing projects for a customer with filters and cursor.
- Returns the same error shapes and status codes as GraphQL.

---

## Design highlights

This repo is built to show:

- API-first thinking:
  Schema and contracts come before storage details.
- Replaceable infrastructure:
  DynamoDB used as a pattern, not a hard dependency.
- Ownership mindset:
  Same person can touch frontend, API, domain, and tests.
- Practical reliability:
  Typed errors, clear auth behavior, stable response shapes.
- Extensibility:
  Repositories, shared packages, and small modules make it easy to grow.

---

## Roadmap

See `ROADMAP.md` for a short list of next steps:

- Multi-tenant support
- Real workflow integration for asset activation
- Observability stack
- Deployment story
- Caching strategy
- Microfrontend shell integration

Each step is sized so this can grow from a focused sample into a production-ready blueprint without rewrites.
