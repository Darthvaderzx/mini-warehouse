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
- Multi-tenant backend, single shared Postgres database, RLS + app-layer tenant scoping.
- Offline task-based execution on PDT (pick, putaway, count, receipt-check) with online-only login, per [sync-protocol.md](sync-protocol.md).
- Concurrent PDTs working the same warehouse simultaneously (multiple pickers on one floor), with download-time stock reservation.
- Camera-based scanning (ML Kit) on Android, min target Android 9–11 (exact floor TBD).

## Explicitly out of v1 (revisit later, not blocked on)

- Serial number tracking (electronics-style individual-unit tracking) — schema hook (`tracksSerial`, `SerialUnit`) exists, but full workflow (RMA, warranty) is phase 2 unless the expo demo specifically requires it.
- 3PL-style multi-owner inventory within one tenant.
- Hardware barcode-scanner SDK integration on PDT (Zebra/Honeywell/etc.) — v1 is camera+ML Kit only; the existing manufacturer-auto-detect app is the reference for adding this later.
- Offline login / device-token revocation.
- Database-per-tenant (kept as a documented escape hatch, not built).
- Costing/valuation — expected to integrate with external accounting rather than being built here.
- Kitting/assembly, replenishment automation, cartonization, carrier label integration.

## Still open — needs an answer before the affected area is implemented

These didn't block starting the architecture, but will block implementation of the areas they touch:

- Exact `Location` hierarchy: fixed levels vs. fully tenant-configurable depth.
- Reservation TTL for stock held by a task download that never syncs.
- Sync batch partial-failure behavior (reject whole batch vs. apply up to first invalid event).
- Master-data cache staleness limit on the PDT.
- Backend internal architecture style (vertical slice vs. layered, Minimal API vs. Controllers, EF Core vs. Dapper) — not yet decided, needed before backend scaffolding starts.
- Web app conventions (App Router usage, component library, data-fetching/state approach) — not yet decided.
- Android module structure and DI approach — the existing manufacturer-detection app is a reference point but hasn't been reviewed against this project's needs yet.
- Non-functional targets: expected tenant count, SKUs/tenant, concurrent PDTs, scan-to-response latency target, backup/RPO/RTO, data residency requirements.
- Deployment specifics beyond "Docker Compose for v1": hosting provider, CI/CD, observability stack.
- Exact minimum Android API level (9 vs. 11) — pending a look at actual target device fleet.
