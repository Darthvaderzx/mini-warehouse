# Web App Conventions (v1)

**Decision:** Next.js App Router, Server Components for reads + TanStack Query for interactive/client state, shadcn/ui + Tailwind, React Hook Form + Zod, Orval generating typed TanStack Query hooks from the OpenAPI spec, a BFF session pattern for auth, Playwright for e2e.

## App Router, not Pages Router

Next.js's older `pages/` routing model is effectively legacy; `app/` is where all current framework investment goes. Not a real debate for a greenfield project.

## Data: Server Components for reads, TanStack Query for the rest

Most of this app's screens are read-heavy back-office views (item lists, task queues, inventory by location) — a good fit for React Server Components fetching data server-side and shipping rendered HTML. TanStack Query (React Query) layers on top for anything interactive: mutations (approve a count variance), polling (live device/task status), optimistic UI. No global client-state library (Redux/Zustand) unless a genuine need for client-only shared state shows up — most state here is server state, which TanStack Query already owns.

## UI: shadcn/ui + Tailwind

Not an installed component library — components are copied into the repo and owned directly, built on Radix primitives (accessible by default) and styled with Tailwind. Chosen over Material UI/Ant Design/Chakra because those tend to fight you once your screens don't match their built-in design language; shadcn/ui has no built-in design language to fight.

## Forms: React Hook Form + Zod

Zod schemas double as TypeScript types and runtime validation, giving a client-side validation experience conceptually consistent with FluentValidation on the backend (not shared code across TS/C#, just the same shape of thinking: schema-defined validation, not scattered manual checks).

## Generated API client: Orval → TanStack Query hooks

Orval reads the backend's OpenAPI spec and generates fully-typed TanStack Query hooks directly (e.g. `useCompletePickTaskMutation()`) — not just request/response types, the whole wired hook. This keeps one source of truth (the OpenAPI spec) flowing straight through to a ready-to-use hook, with no hand-written fetch/query wrapper layer in between.

- Re-run whenever the spec changes; wire this into CI so a stale generated client fails the build rather than silently drifting from the backend contract.
- Generated hook names come from the backend's OpenAPI `operationId`s — keep those clean and intentional on the backend side, since a sloppy operation ID becomes a permanent, ugly hook name on the frontend.

## Auth/session: Backend-For-Frontend (BFF) pattern

The browser never holds a raw JWT. Concretely:

1. The login form POSTs to a Next.js **Route Handler** (server-side code within the Next.js app, e.g. `app/api/auth/login/route.ts`), not directly to the ASP.NET Core backend.
2. That route handler calls OpenIddict's `/connect/token` (ROPC grant, per [auth.md](auth.md)) server-to-server, receiving an access + refresh token pair.
3. Both tokens are stored inside a single encrypted, `httpOnly`, secure session cookie. Client-side JavaScript never has access to either token.
4. Every server-side request that needs to call the backend API (a Server Component, a route handler) decrypts the session cookie and attaches the access token as `Authorization: Bearer ...` — entirely server-side.
5. Near expiry, the same server-side code silently calls the refresh grant and rewrites the session cookie; the user notices nothing.
6. Logout calls `/connect/revoke` and clears the cookie.

This is deliberately not the common tutorial pattern of storing a JWT in `localStorage` and attaching it from client-side JS — a web app has a much larger XSS attack surface (arbitrary npm dependencies, browser extensions) than the PDT does, so keeping tokens out of anything JS-readable is the standard mitigation, not optional hardening.

## Testing: Playwright for e2e

See [testing-strategy.md](testing-strategy.md) for the full cross-project testing approach. On the web side specifically: Playwright covers the critical golden paths (login, complete a pick, approve a variance) end-to-end rather than chasing exhaustive coverage; component-level tests are reserved for genuinely complex interactive components, not blanket-applied to every component.

## Open questions

- Whether session cookies use an encrypted-cookie approach (self-contained, no server-side store) or a signed cookie referencing server-side session storage — encrypted-cookie is simpler and sufficient at v1 scale, revisit only if a concrete reason (e.g. needing server-side session revocation beyond token revocation) shows up.
