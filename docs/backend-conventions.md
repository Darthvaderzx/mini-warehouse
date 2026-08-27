# Backend Conventions (v1)

**Decision:** Vertical Slice organization + MediatR (Command/Query + Handler) + FluentValidation (via a MediatR pipeline behavior) + Minimal API for HTTP endpoints + EF Core (code-first, migrations) for data access.

## Vertical Slice, not Layered

Code is organized by business capability, not by technical role. There is no `Controllers/`, `Services/`, `Repositories/` split by layer — instead, each feature (a single use case, roughly one `Task` type or one document-level action) owns its own folder containing everything it needs: its MediatR request, its handler, its endpoint registration, and any feature-specific validation.

Why: this project has many largely-independent workflows (receiving, putaway, picking, opname, adjustments, quarantine release). A layered split tends to accumulate shared "god classes" (one `InventoryService` serving every workflow) that make an isolated change risky. Vertical Slice keeps a change to one workflow contained to one folder — lower blast radius for both human and agentic development, and easier to find "where does X happen" by feature name rather than by guessing which layer it lives in.

## MediatR: Command/Query + Handler

Each slice is a MediatR request (`ICommand`/`IRequest`) plus its `IRequestHandler`. This matches the pattern already used in prior Controller-based work — the only change is where the `mediator.Send(...)` call is made from (a Minimal API endpoint delegate instead of a Controller action; see below).

- All actual business logic lives in the handler, never in the endpoint delegate.
- Cross-cutting concerns (logging, authorization checks) can be added later as further MediatR pipeline behaviors without touching individual handlers — not built for v1, but the pattern leaves room for it.

## FluentValidation, via a MediatR pipeline behavior

Each request that needs input validation gets a colocated `IValidator<TRequest>` (FluentValidation), living in the same feature folder as its command/query. A single `ValidationBehavior<TRequest, TResponse>` registered once in the MediatR pipeline runs the matching validator (if one exists) before the handler executes, short-circuiting with a validation-failure result otherwise.

This keeps handlers free of manual `if (x == null) throw ...` guard clauses — a handler can assume its request is already valid by the time it runs. Validators are opt-in per request (a slice with nothing to validate just has no validator registered), so this doesn't force boilerplate onto trivial commands.

## Minimal API, not Controllers

Endpoints are registered directly (`app.MapPost(...)`, grouped via `app.MapGroup(...)`) rather than through Controller classes, colocated with each feature's slice. An endpoint delegate does exactly three things: bind the request, call `mediator.Send(...)`, map the result to an HTTP response. No logic beyond that.

**Deliberate discipline required here because the API is contract-first:** Minimal API doesn't generate rich OpenAPI metadata automatically the way `[ApiController]` + XML doc comments do. Every endpoint must explicitly annotate summary, request, and response types (`.WithSummary()`, `.Produces<T>()`, etc.) from the start — this isn't optional polish, it's what the generated TypeScript/Kotlin clients depend on being accurate.

## EF Core: code-first, migrations

Entities are defined as C# classes; schema is generated and evolved via EF Core migrations (`dotnet ef migrations add`), not hand-written SQL DDL. This was already implied by the multi-tenancy design in [architecture.md](architecture.md) — the tenant-isolation app-layer guard depends specifically on EF Core's global query filter feature, which Dapper has no equivalent for. See that doc for the full reasoning; this section just confirms it's settled, not still open.

- One `DbContext` per tenant-scoped boundary (single `DbContext` for v1 — no reason yet to split it).
- The global query filter applied to every tenant-owned entity, resolving `tenant_id` from the authenticated JWT claim, is configured once in `OnModelCreating` — not repeated per entity by hand.

## Suggested folder shape

```
/backend
  /src
    /Features
      /Picking
        CompletePickTask.cs      (Command + Handler + Validator + endpoint registration)
        ShortPick.cs
      /Putaway
        ConfirmPutaway.cs
      /Opname
        SubmitCount.cs
        ResolveVariance.cs
      /Auth
        ...
    /Domain
      Item.cs, ItemUnit.cs, Barcode.cs, Location.cs, Task.cs, Movement.cs, ...
    /Infrastructure
      AppDbContext.cs, migrations/, tenant resolution, OpenIddict setup
    Program.cs                    (endpoint group registration, DI, middleware)
```

Exact naming and whether each slice is one file or a small folder (request/handler/endpoint split into three files) is left to whoever starts implementation — the boundary that matters is feature-based folders, not the file count within one.

## Testing

See [testing-strategy.md](testing-strategy.md) for the full approach. In short: unit test handlers directly for branching business logic, integration test anything touching EF Core/RLS/tenant isolation against a real Postgres via Testcontainers, and give the offline sync/movement-ledger logic dedicated concurrency and replay tests — that combination catches more real bugs here than a large unit-test suite would.
