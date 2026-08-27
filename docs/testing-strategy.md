# Testing Strategy (v1)

Sized for a small team, not an enterprise QA org. The goal is to test the things a human clicking through the app can't reliably catch — concurrency, tenant isolation, idempotency/replay, stock-quantity correctness — and skip testing the things they can, like straightforward CRUD or simple UI rendering. Don't chase coverage numbers; chase the failure modes that are expensive or embarrassing to discover in production.

## Backend

- **Unit test MediatR handlers directly** — no HTTP, no database. Vertical Slice makes this natural: a handler is a small, isolated unit with clear inputs/outputs. Prioritize handlers with real branching logic: FEFO vs. FIFO allocation, quarantine status transitions, short-pick handling. Skip unit-testing a handler that's a thin pass-through with no logic of its own.
- **Integration test anything touching EF Core, RLS, or tenant isolation**, against a real Postgres instance (via Testcontainers, which spins up a disposable Postgres in a container per test run — no shared test database to get into a bad state). This is the single highest-value category of test in this whole project: a forgotten global query filter or a misconfigured RLS policy is invisible by inspection and invisible by manual clicking (you'd need two tenant accounts and to specifically try to cross the boundary) — exactly the kind of bug an automated test catches for free and a human tester usually doesn't think to try.
- **A handful of full-pipeline tests** (via `WebApplicationFactory`, hitting real Minimal API endpoints) on the highest-risk paths: completing a task, applying a sync batch. Not every endpoint — just the ones where the request pipeline itself (model binding, validation behavior, auth) is part of what could break.
- **The offline sync / movement-ledger logic deserves dedicated integration tests**, beyond the general RLS/EF Core coverage above: simulate two devices racing to download the same `PickTask` (reservation should prevent double-allocation), and simulate a sync batch being replayed twice (should be a no-op, not double-applied). This is the area flagged from day one as the hardest to get right and the least forgiving of manual testing — you can't easily "eyeball" a race condition.

## Web

- **Playwright, covering the golden paths only** — login, complete a pick end-to-end, approve a count variance — not every screen. A handful of well-chosen e2e tests catches most real regressions in an app like this; a large e2e suite mostly buys slow CI and flaky tests.
- **Component-level tests reserved for genuinely complex interactive components** (a form with conditional validation logic, not a static display component).

## Android (PDT)

- **Instrumented tests for the sync engine specifically**: task download → offline execution → event queue → upload → idempotent replay on retry. This is the correctness-critical, hardest-to-manually-verify part of the whole system (you'd need to physically put a device in airplane mode, perform actions, and reconnect, repeatedly, to manually test what an instrumented test checks in seconds).
- UI screens can lean on manual testing at this team size — a picking screen with a scan-and-confirm flow is fast to click through by hand and low-risk to get subtly wrong in a way manual testing wouldn't catch.

## What's explicitly not being chased

- 100% or any specific coverage percentage as a target.
- Unit tests for simple CRUD operations or straightforward UI rendering — manual testing already covers these adequately at this scale.
- Testing framework-provided behavior (EF Core itself works; you're testing your usage of it, specifically the tenant-scoping and RLS interaction).

## Further reading

A few starting points, not a full curriculum:

- [Testcontainers for .NET](https://testcontainers.com/) — spinning up real Postgres in tests instead of mocking the database.
- [Microsoft's testing docs for .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/) — xUnit basics, `WebApplicationFactory` for integration tests.
- [Playwright docs](https://playwright.dev/) — getting started with e2e testing.
- Kent C. Dodds, ["Write tests. Not too many. Mostly integration."](https://kentcdodds.com/blog/write-tests) — the reasoning behind favoring integration tests over a large unit-test pyramid, which is the shape this doc follows.
