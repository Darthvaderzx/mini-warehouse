# Auth (v1)

**Decision:** ASP.NET Core Identity for user/credential storage, OpenIddict as the OAuth2/OIDC token-issuing server on top of it. JWT access tokens throughout, per the tenant-resolution model in [architecture.md](architecture.md).

## Why OpenIddict, not a hand-rolled JWT endpoint

Two v1 requirements push toward a real OAuth2 server rather than a simple "check password, sign a JWT" endpoint:

1. **Shift-length sessions with silent refresh.** A PDT logs in online, then may work offline for a full shift. The access token needs a short lifetime for security, but the operator can't be forced to re-authenticate mid-shift just because it expired while offline. That requires refresh token issuance, rotation, and reuse detection (a revoked refresh token being replayed is a signal of a stolen device) — a nontrivial security surface to get right by hand.
2. **Third-party integration is a stated goal, not hypothetical.** Customers integrating their own systems (existing ERP, their own label printers) with this platform need scoped, revocable API credentials. OAuth2's Client Credentials grant is exactly that, and reusing the same authorization server for it means no separate bespoke API-key system to design and secure later.

Building this in now, before any tenant has a live session or integration depending on the token format, is free. Retrofitting it after tenants are live means a breaking auth migration in production. The setup/learning cost of OpenIddict is accepted as a one-time cost against that.

## How the pieces fit together

- **ASP.NET Core Identity** owns `User` (password hashes, lockout, roles). Unchanged in role — it's the credential store, not the token issuer.
- **OpenIddict** owns token issuance, refresh, and revocation via its own endpoints (`/connect/token`, `/connect/revoke`), backed by `OpenIddict.EntityFrameworkCore` (adds its own Applications/Authorizations/Scopes/Tokens tables via ordinary EF Core migrations against the same Postgres database — no separate auth database).
- **Custom claims** (`tenant_id`, `role`, and — for PDT sessions — `device_id`) are injected into the token at issuance time via an OpenIddict server event handler, sourced from the authenticated Identity user. `tenant_id` is what the RLS session-variable setup in [architecture.md](architecture.md#multi-tenancy-single-shared-postgres-database) depends on — nothing about that design changes.

## Grant types used

| Client | Grant | Why |
|---|---|---|
| Web app (first-party) | Resource Owner Password Credentials (ROPC) | Direct login form, no browser-redirect ceremony needed — it's our own trusted client, not a third party. |
| Android PDT (first-party) | Resource Owner Password Credentials (ROPC) | Same reasoning; native login screen posts credentials directly to `/connect/token`. |
| Future third-party integrations (customer ERP, etc.) | Client Credentials | Machine-to-machine, scoped (e.g. `inventory:read`), independently revocable per integration client — not tied to any human user session. |

ROPC is technically deprecated in the OAuth 2.1 draft for third-party/public clients, but remains an accepted pattern for first-party clients you fully control (no redirect surface to exploit). Not used for anything but our own apps.

## Token lifetimes

- **Access token:** short-lived (~30–60 min, exact value TBD during implementation) — limits the damage window if a token leaks, cheap to refresh silently.
- **Refresh token:** shift-length (~12–24h, TBD) — long enough that an operator working offline all shift doesn't get logged out, refreshed silently whenever the device has connectivity (natural to piggyback on the same sync-connectivity window described in [sync-protocol.md](sync-protocol.md)).
- **Rotation:** each refresh issues a new refresh token and invalidates the previous one (OpenIddict default behavior). Reuse of an already-rotated-out refresh token revokes the whole token family — this is the signal that a device's stored token was copied/stolen.
- **Revocation:** exposed on the web app so an ops user can kill a specific device's session immediately (lost/stolen PDT), rather than waiting for expiry.

## Identity model decisions

- **Email is globally unique across the whole platform**, not scoped per tenant — matches ASP.NET Identity's default store behavior, and keeps login simple (email + password, no "which company" selection step) for the solo-operator end of the target market. A person wanting the same email across two different tenants they separately own is an edge case explicitly deferred — out of scope for v1.
- **Roles are fixed, not per-tenant-configurable**, for v1: `Owner/Admin`, `Supervisor`, `Operator`. A full custom-RBAC builder is exactly the kind of enterprise-WMS overhead this project exists to avoid; revisit only if enough tenants ask for it.
- **Device identity is separate from user identity.** A PDT's JWT represents the logged-in operator (via ASP.NET Identity + OpenIddict as above); the physical device is tracked as its own lightweight entity (stable device ID, sent as a header alongside the access token), used for `Task.assigned_device_id` and reservation logic in [sync-protocol.md](sync-protocol.md). The same operator may use different devices across shifts, and the same device may be used by different operators — these are not the same axis and shouldn't be conflated in the Identity model.
- **Login is online-only** (already decided in [sync-protocol.md](sync-protocol.md#login)) — no offline credential cache or offline token issuance to design.

## Open questions

- Exact access/refresh token lifetime values — needs real shift-length data, not guessed now.
- Scope granularity for future Client Credentials integrations (`inventory:read` was illustrative, not final).
- Whether OpenIddict's authorization-code flow is ever needed (e.g. if a future admin SSO / "login with Google" is wanted for the web app) — not needed for v1.
