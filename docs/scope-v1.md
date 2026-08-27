# v1 Scope

## Positioning

An industry-agnostic, small-scale WMS for single-warehouse (or single-storage-space) customers who can't justify enterprise WMS cost/overhead. Multi-tenant cloud backend, Android PDTs for floor work, web app for back-office/decision-level work. See [architecture.md](architecture.md).

## Decision: generic core, not per-industry data models

Considered shipping "industry packs" (Pharma, Electronics, General) selected at tenant registration, each unlocking its own tables/workflows. **Rejected** — it requires building a plugin/module framework before any real feature exists, and multiplies the test matrix per pack combination. Not worth it at this project's scale or timeline.

**Chosen instead:** one schema for every tenant. Industry-specific behavior (lot/expiry tracking, FEFO, quarantine holds, serialization) is driven by capability flags on `Item`, exercised at runtime. A tenant that needs none of it never sees the fields; a tenant that needs all of it gets full capability without a special "edition." See [domain-model.md](domain-model.md).

If "industry edition" branding is wanted later for sales/pricing purposes, implement it as a preset that flips a bundle of existing flags and shows/hides UI panels per subscription tier — not a different data model.

## In scope for v1

Driven in part by an upcoming hospital-adjacent expo demo, which pulled lot/expiry/quarantine forward from "later" to v1:

- Core flows: receiving (PO-driven, web-side decisions + PDT physical check), putaway, picking, opname (full + cycle count).
- Lot/batch tracking + expiry date, per item (`tracksLot`, `tracksExpiry`).
- FEFO allocation for expiry-tracked items; FIFO default otherwise.
- `InventoryStatus` including `Quarantined`/`OnHold`, with a release workflow on the web app.
- Flexible barcode support: EAN/UPC/Code128/QR + GS1-128 AI parsing (GTIN, lot, expiry, quantity).
- Tenant-side barcode mapping tool (map an arbitrary/legacy code to an `ItemUnit`), for customers integrating existing labeling or an existing warehouse system.
- Arbitrary-depth pack hierarchy per item (each/sachet/box/pallet/...), not fixed at 3 levels.
- Fully tenant-configurable `Location` hierarchy depth (self-referencing table, no fixed level count). See [domain-model.md](domain-model.md#location-hierarchy-fully-tenant-configurable-depth-decided).
- Multi-tenant backend, single shared Postgres database, RLS + app-layer tenant scoping.
- Auth via ASP.NET Core Identity + OpenIddict (JWT, shift-length refresh, fixed role model). See [auth.md](auth.md).
- Backend organized as Vertical Slice + MediatR + FluentValidation + Minimal API, EF Core code-first with migrations. See [backend-conventions.md](backend-conventions.md).
- Web organized as App Router + Server Components/TanStack Query + shadcn/ui + Orval-generated hooks + BFF session auth. See [web-conventions.md](web-conventions.md).
- Testing approach favoring integration coverage (tenant isolation, sync/concurrency) over exhaustive unit tests. See [testing-strategy.md](testing-strategy.md).
- Offline task-based execution on PDT (pick, putaway, count, receipt-check) with online-only login, per [sync-protocol.md](sync-protocol.md).
- Concurrent PDTs working the same warehouse simultaneously (multiple pickers on one floor), with download-time stock reservation.
- Camera-based scanning (ML Kit) on Android, min API 21 (Android 5.0) — the actual floor of both Jetpack Compose and ML Kit's on-device Barcode Scanning API; older devices are excluded by the libraries themselves, not by an arbitrary choice. Old-device reuse is viable down to whatever OS version is actually installed on them, no lower than 21.

## Explicitly out of v1 (revisit later, not blocked on)

- Serial number tracking (electronics-style individual-unit tracking) — schema hook (`tracksSerial`, `SerialUnit`) exists, but full workflow (RMA, warranty) is phase 2 unless the expo demo specifically requires it.
- Handling units / LPN (tracking an individual box/pallet as its own scannable, trackable entity independent of its contents) — v1 treats packaging as `ItemUnit` pack levels only. Revisit if a customer needs to scan and track a specific physical container's identity, not just what's in it.
- 3PL-style multi-owner inventory within one tenant.
- Hardware barcode-scanner SDK integration on PDT (Zebra/Honeywell/etc.) — v1 is camera+ML Kit only; the existing manufacturer-auto-detect app is the reference for adding this later.
- Offline login / device-token revocation.
- Database-per-tenant (kept as a documented escape hatch, not built).
- Costing/valuation — expected to integrate with external accounting rather than being built here.
- Kitting/assembly, replenishment automation, cartonization, carrier label integration.

## Still open — needs an answer before the affected area is implemented

These didn't block starting the architecture, but will block implementation of the areas they touch:

- Reservation TTL for stock held by a task download that never syncs.
- Sync batch partial-failure behavior (reject whole batch vs. apply up to first invalid event).
- Master-data cache staleness limit on the PDT.
- Android module structure and DI approach — deliberately deferred to its own dedicated pass later; the existing manufacturer-detection app is a reference point but hasn't been reviewed against this project's needs yet.
- Non-functional targets: SKUs/tenant is small (a few dozen at most) and not a design constraint at this scale. Tenant count is intentionally unknown pending real market signal — the shared-schema Postgres design doesn't need a number to be architected correctly and comfortably scales into the hundreds of tenants at this SKU count without re-architecture. Still undecided: concurrent PDTs per warehouse, scan-to-response latency target, backup/RPO/RTO, data residency requirements.
- Deployment specifics beyond "Docker Compose for v1": hosting provider, CI/CD, observability stack.
- Auth token lifetime values and integration scope granularity — see [auth.md](auth.md)'s open questions.
- Session cookie storage approach (self-contained encrypted cookie vs. server-side session store) — see [web-conventions.md](web-conventions.md)'s open questions.
