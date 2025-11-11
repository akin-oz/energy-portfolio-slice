# energy-portfolio-slice

A focused product slice that models an **energy portfolio domain** and exposes it through a **TypeScript**, **GraphQL**,
and **React** stack.

The goal: show how I design and ship a vertical slice the way I’d work as a **Senior Product Engineer (Frontend)** —
domain-first, API-first, observable, and safe to run.

---

## Why this exists

This repo is a compact example of how I approach:

- **Product engineering** – start from the problem & domain, not random endpoints.
- **Contracts first** – clear GraphQL API shaped around real use-cases.
- **You build it, you run it** – structure for tests, monitoring, and extensions.
- **Frontend as part of the system** – UI driven by real contracts, not mocks.

It’s intentionally small, but every piece is something I’d be comfortable running in production once wired to real
infra.

---

## Note for epilot reviewers

Eka mentions you’re open to candidates using an existing project as a technical assessment. I created this repo
specifically with that in mind.

If you choose to review this instead of (or in addition to) a custom assignment, here’s what it is meant to show:

- A **vertical slice** that could exist in your ecosystem: customers → projects → energy assets.
- **API-first, domain-first design** with clear GraphQL contracts and pagination/filters.
- A **TypeScript monorepo layout** that keeps domain, API, and UI cleanly separated and easy to extend.
- An example of how I think about **errors, testability, and production readiness** (without overbuilding infra).

I’m happy to walk through decisions, extend this slice, or adapt it live in an interview setting.

---

## Tech stack

Core choices:

- **Language:** TypeScript
- **API:** GraphQL (Apollo-style server)
- **Frontend:** React + Vite (thin slice consuming the API)
- **Tooling:** pnpm, Vitest, ESLint, Prettier
- **Architecture style:** API-first, modular packages, ready for cloud-native / serverless backends

No framework gymnastics, just tools I’d pick for a real product slice.

---

## Repository structure

```txt
├─ packages/
│  ├─ domain/        # Core domain: Customer, Project, EnergyAsset, validation, factories
│  └─ shared/        # Shared types, error helpers, pagination utilities
├─ services/
│  └─ api/           # GraphQL schema, resolvers, context, seed data
├─ apps/
│  └─ web/           # React app consuming the API (customers → projects → assets)
├─ pnpm-workspace.yaml
├─ tsconfig.base.json
└─ vitest.workspace.ts
```

This layout keeps **domain**, **infrastructure**, and **UI** cleanly separated while staying small enough to review in
one sitting.

---

## Getting started

### Prerequisites

- Node 18+
- pnpm

### Install

```bash
pnpm install
```

### Run tests

```bash
pnpm test
```

This validates the domain layer and basic API behavior.

### Run the GraphQL API

```bash
pnpm dev:api
```

By default:

- GraphQL endpoint: `http://localhost:4000/graphql`

### Run the Web App

```bash
pnpm -C apps/web dev
```

- Web app: `http://localhost:5173` (or whatever Vite prints)

Environment variables (optional):

- `VITE_GRAPHQL_URL` – GraphQL endpoint URL. Defaults to `http://localhost:4000/graphql`.
- `VITE_API_KEY` – If your API is protected by an API key, set it and the app will send it as an `x-api-key` header on
  all GraphQL requests.

---

## GraphQL API

The schema models three core entities:

- `Customer`
- `Project`
- `EnergyAsset`

Why GraphQL here: composition across customers → projects → assets, the ability to fetch precisely what each view
needs (and nothing more), and a single contract that multiple product surfaces can share (web, mobile, ops tooling)
without bespoke endpoints.

Example queries:

```graphql
# Get a single customer
query CustomerById {
  customer(id: "cust_1") {
    id
    name
    createdAt
  }
}

# Get customers (paginated)
query Customers {
  customers(first: 10) {
    edges {
      cursor
      node {
        id
        name
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Get projects for a customer (paginated, optional status filter)
query ProjectsByCustomer {
  projectsByCustomer(customerId: "cust_1", first: 10, status: ACTIVE) {
    edges {
      cursor
      node {
        id
        name
        status
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}

# Get energy assets for a project (paginated, optional type filter)
query EnergyAssetsByProject {
  energyAssetsByProject(projectId: "proj_3", first: 10, type: SOLAR) {
    edges {
      cursor
      node {
        id
        type
        capacityKw
        active
        createdAt
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

Resolvers are backed by seed data and structured so a real datastore can be plugged in without changing the contract.

Errors: client-visible validation errors (e.g. invalid cursor) surface with `extensions.code`, for example:

```json
{
  "errors": [
    {
      "message": "Invalid cursor",
      "extensions": {
        "code": "VALIDATION_ERROR"
      }
    }
  ]
}
```

---

## What this demonstrates

- **Domain-first design** – `domain` defines types and invariants before transport.
- **API-first contracts** – GraphQL schema is designed around realistic usage.
- **Clean layering** – domain, API, and UI are decoupled but aligned.
- **Testable by default** – Vitest + deterministic seed data for fast feedback.
- **Frontend integrated with backend** – React UI consumes the real API.
- **Ready for "you build it, you run it"** – structure for auth, logging, and monitoring without redesign.

---

## Roadmap / Extensions

These are intentionally optional and can be added depending on the audience:

- Persistence: swap in DynamoDB/Postgres via a repository layer.
- Auth: API key roles (admin/user/readonly) enforced via GraphQL context.
- Error taxonomy: map domain/auth/validation errors to structured `extensions.code`.
- Dataloader: batching to avoid N+1 issues.
- Logging & tracing: structured logs with `traceId` from client → API.
- Workflow stub: `activateEnergyAsset` mutation + event log to demonstrate workflow thinking.
- Deployment sketch: minimal CI/CD config and infra notes.

---

## How to read this as a reviewer

If you’re skimming:

1. `packages/domain` – how I think about models and invariants.
2. `services/api` – how I design contracts, pagination, and error handling.
3. `apps/web` – how I integrate UI with those contracts.
4. Tests & README – proof it’s structured like a real product slice, suitable as an example for a technical assessment.
