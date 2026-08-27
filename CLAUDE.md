# Mini Warehouse — Project Guide

Small-scale, multi-tenant warehouse management system: Android PDTs for floor work (offline-capable), a Next.js web app for back-office/decision-level work, and an ASP.NET Core backend as the single source of truth. Industry-agnostic by design — see [docs/scope-v1.md](docs/scope-v1.md) for why a generic core was chosen over per-industry data models.

**Read before working in this repo:**
- [docs/architecture.md](docs/architecture.md) — tech stack, multi-tenancy model, monorepo layout, contract-first API
- [docs/domain-model.md](docs/domain-model.md) — entities and why they're shaped this way
- [docs/sync-protocol.md](docs/sync-protocol.md) — offline task queue + event ledger design
- [docs/auth.md](docs/auth.md) — ASP.NET Identity + OpenIddict, token lifetimes, grant types, role model
- [docs/backend-conventions.md](docs/backend-conventions.md) — Vertical Slice + MediatR + FluentValidation + Minimal API + EF Core
- [docs/scope-v1.md](docs/scope-v1.md) — what's in/out for v1, and what's still an open decision
- [docs/glossary.md](docs/glossary.md) — domain vocabulary; use these terms, not synonyms

## Repo layout

```
/backend    ASP.NET Core WebAPI, .NET 10
/web        Next.js + React admin/back-office app
/android    Kotlin + Jetpack Compose PDT app
/docs       Architecture and domain documentation (read this first)
/infra      Docker Compose, deployment config
```

## Non-negotiable invariants

- **Backend is the sole source of truth for stock.** No client (web or PDT) ever computes or asserts a final on-hand balance — only the backend, by replaying `Movement` records.
- **Every tenant-owned table has `tenant_id`**, enforced by both an EF Core global query filter and a Postgres RLS policy. Never trust a client-supplied tenant ID — always resolve it from the authenticated JWT claim.
- **Tokens are issued by OpenIddict, never hand-signed elsewhere.** All access tokens carry `tenant_id`, `role`, and (for PDT sessions) `device_id` claims injected at issuance — see [docs/auth.md](docs/auth.md). Device identity and user identity are separate axes; don't conflate them.
- **No per-industry schema forks.** Industry-specific behavior (lot/expiry, FEFO, quarantine, serials) is driven by capability flags on `Item` (`tracksLot`, `tracksExpiry`, `tracksSerial`), not by separate tables or code paths per vertical.
- **Barcodes are not unique identifiers.** The same code can map to more than one `ItemUnit`. Don't add a uniqueness constraint on `Barcode.code` — ambiguity is resolved by task context, then by prompting the operator.
- **The API contract is OpenAPI-first.** Web and Android clients are generated from the backend's spec, not hand-written against it.

## Before implementing a new area

Check [docs/scope-v1.md](docs/scope-v1.md)'s "Still open" list — several implementation-level decisions (web conventions, Android module structure, exact Location hierarchy depth) are intentionally not yet made. Flag them rather than silently picking an answer.
