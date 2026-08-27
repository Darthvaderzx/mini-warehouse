# Architecture

Status: v1 foundational decisions. See [scope-v1.md](scope-v1.md) for what's in/out and what's still open.

## Tech stack

| Layer | Choice |
|---|---|
| Web (admin/back-office) | Next.js + React |
| Backend API | ASP.NET Core WebAPI, .NET 10 |
| PDT app (Android handheld scanners) | Kotlin, Jetpack Compose |
| Database | PostgreSQL (single instance, see Multi-tenancy below) |
| Containerization | Docker |

## Repo layout (monorepo)

```
/backend    ASP.NET Core WebAPI solution
/web        Next.js admin/back-office app
/android    Kotlin/Jetpack Compose PDT app
/docs       Architecture, domain model, sync protocol, glossary, scope
/infra      Docker Compose, deployment config
```

One repo so the API contract (see below) can't silently drift between backend, web, and Android — a single PR can touch the contract and all three consumers together.

## API contract: contract-first via OpenAPI

The backend's OpenAPI spec is the source of truth for the HTTP contract. Web (TypeScript) and Android (Kotlin) clients are generated from it rather than hand-written, so the three stacks can be developed in parallel without drifting apart. Any breaking API change starts with a spec change.

## Multi-tenancy: single shared Postgres database

**Decision:** one Postgres database, shared schema, `tenant_id` on every tenant-owned table — not database-per-tenant.

Enforcement is two-layered, both required:
1. **Application layer:** every query is scoped by `tenant_id` resolved from the authenticated user's JWT claim (never from client-supplied input). EF Core global query filters apply this automatically.
2. **Database layer:** Postgres Row-Level Security (RLS) policies on every tenant-owned table, keyed off a session variable (`app.tenant_id`) set from the JWT claim once per request. This is the guard that holds even if application-layer filtering has a bug — the database itself cannot return another tenant's rows.

This is what makes "tenant A can never print tenant B's barcode label, even by accident" hold structurally rather than by convention.

**Why not database-per-tenant:** at this project's target scale (smaller warehouses, expected tens to low hundreds of tenants), per-tenant databases cost more than they buy — N migration runs to keep in sync, connection pool pressure, and cross-tenant admin/reporting becoming multi-database fan-outs. That's the enterprise-WMS overhead this project exists to avoid.

**Escape hatch, not built now:** if a future customer requires hard database isolation, the data-access layer should resolve its connection through a tenant-keyed connection factory (even though v1 only ever returns one connection string). That keeps "give this one tenant a dedicated database" a configuration change later, not an architecture change.

## Product modeling: generic core, no per-industry schema

This is an industry-agnostic WMS by design (see [scope-v1.md](scope-v1.md)). Instead of a different data model per vertical (pharma vs. electronics vs. general retail), every tenant uses the same schema, and industry-specific behavior is driven by per-Item capability flags:

- `Item.tracksLot`, `Item.tracksExpiry`, `Item.tracksSerial` — default `false`, opt-in per item.
- A single generic `InventoryStatus` enum (`Available / OnHold / Quarantined / Damaged / Expired`) exists for every tenant; a tenant that never needs `Quarantined` simply never sets it.
- Picking allocation branches at runtime on `tracksExpiry` (FEFO vs. FIFO) rather than on a per-tenant code path.
- The PDT UI shows/hides lot, expiry, and serial capture fields per item based on its flags — same screen, conditional fields, not a different app per industry.

See [domain-model.md](domain-model.md) for the full entity design and why this shape was chosen over industry-specific "packs" (rejected — see scope doc).

## Barcode & UoM flexibility

Because a goal is easy integration with whatever a customer already has (their own labels, their own legacy codes) and with Barkode-sold label printers, barcodes are modeled as a flexible, non-unique lookup rather than a fixed identifier:

- `Item` → `ItemUnit` (arbitrary-depth pack hierarchy: each, sachet, box, pallet, ...) → `Barcode`.
- A `Barcode` is scoped `(tenant_id, code, symbology)` and is **not unique** — the same raw code may map to more than one `ItemUnit` (shared EAN across variants, or a code reused across pack levels). Ambiguous scans are resolved by context first (active task's expected items), then by prompting the operator.
- GS1-128 Application Identifier parsing (GTIN, lot, expiry, quantity) is supported in v1 since it's the same scan-handling path as lot/expiry capture.
- Tenant admins can map arbitrary/legacy codes to an `ItemUnit` through the web app, for customers integrating an existing labeling system.

## Offline sync: task queue + append-only movement ledger

The backend is always the sole source of truth for stock balances. The PDT never computes or asserts a final on-hand quantity — it pulls assigned work, executes it, and reports what it observed. Full design: [sync-protocol.md](sync-protocol.md).

Summary:
- Backend creates `Task`s (`PickTask`, `PutawayTask`, `CountTask`, `ReceiptCheckTask`) and assigns them to a device/user while online.
- The PDT executes tasks offline and syncs back a batch of immutable, idempotent `TaskEvent`s (client-generated UUID per event) when connectivity returns.
- The backend applies each event as a `Movement` (an append-only ledger entry) inside a transaction; on-hand balances are derived from Movements, never stored as a directly-synced counter.
- Concurrent PDTs working the same physical warehouse are explicitly supported (a customer may run several pickers on one floor at once), so stock is **soft-reserved at task-download time** using `SELECT ... FOR UPDATE SKIP LOCKED`, not at task-creation time.
- Device clocks are never trusted for ordering — device timestamps are stored for audit/display only; the backend's receipt order is authoritative for FEFO/FIFO and conflict resolution.

## PDT (Android)

- Kotlin + Jetpack Compose. Camera-based scanning via ML Kit for v1; the existing manufacturer-detection app (auto-inits the correct OEM scanner SDK — Zebra/Honeywell/etc.) is the reference integration point for a later hardware-scanner mode, not required for v1.
- Target: Android 9–11 minimum (exact floor to be confirmed against actual target devices).
- Login is online-only — no offline credential caching or device-token revocation flow needed for v1. A site with connectivity too poor for online login is out of scope for this product; refer to an on-prem/enterprise WMS partner instead.
- Document-level decisions (accepting a PO, approving a count variance, resolving an exception) happen on the web app, which assumes a keyboard and a supervisor. The PDT is scoped to physical-confirmation workflows: check, putaway, pick, count.

## Deployment

Docker Compose for v1 (single environment, no orchestration platform needed at this scale). Deployment specifics (cloud provider, CI/CD, observability stack) are not yet decided — see [scope-v1.md](scope-v1.md).
