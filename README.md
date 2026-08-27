# Mini Warehouse

A small-scale, multi-tenant warehouse management system: Android PDTs for offline-capable floor work, a Next.js back-office web app, and an ASP.NET Core backend as the single source of truth. Built for customers with a single warehouse or storage space who don't need (or can't afford) full enterprise WMS overhead — industry-agnostic by design.

**Start here:** [CLAUDE.md](CLAUDE.md), then [docs/architecture.md](docs/architecture.md).

## Docs

- [docs/architecture.md](docs/architecture.md) — tech stack, multi-tenancy, monorepo layout, sync model summary
- [docs/domain-model.md](docs/domain-model.md) — entities and ERD
- [docs/sync-protocol.md](docs/sync-protocol.md) — offline task queue + event ledger design
- [docs/auth.md](docs/auth.md) — ASP.NET Identity + OpenIddict auth design
- [docs/scope-v1.md](docs/scope-v1.md) — v1 in/out scope and open decisions
- [docs/glossary.md](docs/glossary.md) — domain vocabulary

## Layout

```
/backend    ASP.NET Core WebAPI, .NET 10
/web        Next.js + React admin/back-office app
/android    Kotlin + Jetpack Compose PDT app
/docs       Architecture and domain documentation
/infra      Docker Compose, deployment config
```
