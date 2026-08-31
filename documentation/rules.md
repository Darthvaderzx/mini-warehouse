# Project Rules & Standards - MiniWarehouse

## 1. Scope and Invariants
- **Single Source of Truth**: The Backend is the sole authoritative source of truth for stock balances. Balances are derived dynamically by summing `Movement` ledger records.
- **Multi-Tenancy**: Dual-layer tenant isolation. Every tenant-scoped entity carries a `tenant_id`. PostgreSQL Row-Level Security (RLS) policies and EF Core / API global filters enforce isolation.
- **Offline-First Sync Protocol**: Client operations generate immutable, idempotent `TaskEvent` records with client-generated UUID `eventId`s. Sync endpoint processes events idempotently and generates `Movement` records.
- **Contract-First API**: Back-office Web app and Android PDT app interface with the backend via OpenAPI specification (`backend/openapi/spec.yaml`).
- **Generic Capability Flags**: Products are modeled generically using capability flags (`tracksLot`, `tracksExpiry`, `tracksSerial`, `requiresQuarantineOnReceipt`).
- **Non-Unique Barcodes**: Barcodes map to `ItemUnit` (pack level). Ambiguous barcodes are resolved by task context or operator selection.

## 2. UI Prototype Fidelity
- UI components and pages in `web/` must strictly replicate the approved prototype CSS variables, typography, layout, sidebar navigation, headers, tables, badges, and interactive states.

## 3. Testing and Verification
- Provide comprehensive automated test suites for backend services, sync engine, tenant isolation, and frontend components.
- Ensure CI/CD pipeline at `.github/workflows/ci.yml` passes building and testing.
