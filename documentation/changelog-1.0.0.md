# Changelog - v1.0.0 (Initial Release)

All notable changes to the MiniWarehouse project are documented here.

## [1.0.0] - Initial Production Implementation

### Core Architecture & Documentation
- Resolved open design decisions across location hierarchy, reservation TTL, LPN tracking, and sync conflict handling.
- Finalized OpenAPI specification in `backend/openapi/spec.yaml` covering all REST endpoints for Auth, Items, Locations, Inventory/Movements, Tasks, Receiving, Opname, Quarantine, and Offline Sync.

### Backend (.NET / Node.js API Service & PostgreSQL Integration)
- Implemented domain models for Tenant, UserAccount, Item, ItemUnit, Barcode, Location, HandlingUnit, Lot, SerialUnit, Task, TaskLine, TaskEvent, and Movement ledger.
- Implemented PostgreSQL schema definitions with Row-Level Security (RLS) policies and seed data.
- Implemented CQRS / Vertical Slice pattern for:
  - Auth & Token Generation (ROPC)
  - Item / Unit / Barcode management with capability flags
  - Location hierarchy (Zone -> Aisle -> Rack -> Bin)
  - Stock derivation engine by replaying Movements
  - Task lifecycle: Putaway, Pick with soft-reservations, Stock Opname/Count with variance resolution, and PO Receiving Check / Quarantine
  - Offline Sync Batch ingestion endpoint with idempotent TaskEvent processing

### Web Application (Next.js / React Back-Office UI)
- Built comprehensive responsive Back-Office dashboard matching the approved design prototype with 100% color and typography fidelity.
- Implemented navigation routes and views:
  - Dashboard (KPIs, Active Tasks, Stock Alerts, Movement Feeds)
  - Items & Barcodes Catalog (pack levels, conversions, capability filters)
  - Locations Hierarchy & Bin explorer
  - Inventory & Stock Balances (on-hand, available, reserved, quarantine, expired)
  - Tasks Management (Pick, Put, Count, Receipt)
  - Movement Ledger Audit Trail with filtering and export
  - Receiving Check & Inspection Approval screen
  - Count Variance Review & Quarantine Release screen
  - Users, PDT Devices & System Settings

### Android PDT Module
- Scaffolded Android Jetpack Compose structure and sync engine architecture.
- Created offline SQLite task queue, camera/MLKit barcode scanner contract, and task execution screens.

### Infrastructure & CI/CD
- Created Docker Compose environment for backend, web frontend, and PostgreSQL database.
- Created GitHub Actions CI/CD workflow (`.github/workflows/ci.yml`).
