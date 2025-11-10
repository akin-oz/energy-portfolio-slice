# ROADMAP

This roadmap treats `energy-portfolio-slice` as a real product slice:
each phase is deliverable, reviewable, and safe to show.

You can stop after any phase and still demonstrate value.

---

## Phase 1: Solid Core (0.5–1 day)

Goal  
Have a clean, compiling workspace that expresses domain and boundaries.

Scope

- Finalize monorepo wiring:
    - root `tsconfig.base.json`, `pnpm-workspace.yaml`, `vitest.workspace.ts`
- `packages/domain`:
    - domain types for Customer, Project, EnergyAsset
    - factories and seed helpers
    - basic validation helpers
- `packages/shared`:
    - error types and mapping helpers
    - cursor-based pagination utilities

Outcome

- `pnpm test` runs.
- Repo reads as deliberate, not ad hoc.

---

## Phase 2: GraphQL API (In-Memory) (0.5–1 day)

Goal  
Expose the domain through a clear GraphQL contract, no storage complexity yet.

Scope

- `services/api`:
    - GraphQL schema:
        - Customer / Project / EnergyAsset
        - queries for:
            - `customer(id)`
            - `customers`
            - `projectsByCustomer(customerId, first, after, status)`
            - `energyAssetsByProject(projectId, first, after, type)`
    - resolvers backed by in-memory seed data
    - minimal handler for local dev

Outcome

- Running GraphQL endpoint with realistic shapes.
- Example queries documented in README.

---

## Phase 3: Persistence, Pagination, Filters (1–1.5 days)

Goal  
Show that contracts survive real data access and basic growth.

Scope

- Add DynamoDB Local via Docker.
- Introduce repository layer:
    - customers, projects, assets
- Implement:
    - cursor-based pagination
    - filters:
        - Project by status
        - EnergyAsset by type
- Tests:
    - pagination behavior
    - filters over seeded data

Outcome

- Same queries work against real-style storage.
- Storage is swappable (in-memory vs Dynamo-style).

---

## Phase 4: Auth, Errors, REST Mirror (1 day)

Goal  
Demonstrate production discipline: security, consistency, and compatibility.

Scope

- API key auth:
    - roles: admin, user, readonly
    - enforced in GraphQL context
- Typed error taxonomy:
    - DOMAIN_ERROR, AUTH_ERROR, VALIDATION_ERROR, NOT_FOUND, SYSTEM_ERROR
- GraphQL:
    - map known errors into `extensions.code`
- REST:
    - one mirror endpoint for projects-by-customer
    - identical error shapes and status codes
- Tests:
    - unauthorized and forbidden
    - error mapping for GraphQL and REST

Outcome

- Clear behavior for happy/sad paths.
- Easy to reason about for any reviewer.

---

## Phase 5: Dataloader, Logging, Frontend Slice (1–1.5 days)

Goal  
Prove you care about performance patterns and observability, not only endpoints.

Scope

Backend

- Dataloader-style batching:
    - projects by customer id
    - assets by project id
- Structured logging:
    - traceId, path, role, duration, result
- Propagate `traceId` from request headers.

Frontend

- Vite + React + TypeScript app:
    - list customers
    - show projects for selected customer (with status filter)
    - show assets for selected project (with type filter)
- API client:
    - sends API key and `x-trace-id`

Outcome

- End-to-end path:
  UI → GraphQL → data, observable through logs.
- Shows awareness of N+1 issues and traceability.

---

## Phase 6: Activation Workflow Stub and Events (0.5–1 day)

Goal  
Show workflow and event thinking without heavy infra.

Scope

- Add `activateEnergyAsset(assetId)` mutation:
    - validate asset
    - mark as active
    - log `EnergyAssetActivated` event with traceId
- Tests:
    - success
    - not found
    - forbidden

Outcome

- Clear place where a real workflow engine and event bus would plug in.
- Signals ownership beyond CRUD.

---

## Phase 7: Optional Extensions (for specific audiences)

Use selectively depending on the company. Do not ship all by default.

1. Multi-tenant model (0.5–1 day)
    - add tenantId to keys
    - enforce per-key isolation

2. Observability stack (1 day)
    - OpenTelemetry wiring in API
    - trace context from client to backend
    - basic SLIs: p95 latency, error rate

3. Deployment story (1–2 days)
    - simple IaC plus a CI pipeline example
    - minimal config for one cloud provider

4. Caching strategy (0.5 day)
    - persisted GraphQL operations
    - HTTP caching for REST endpoint

5. Microfrontend shell note (0.5 day)
    - document how `frontend` can be mounted as a microfrontend
    - optional minimal shell for demonstration
