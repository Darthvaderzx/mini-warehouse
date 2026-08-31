# Backend API Module

## Frontend/UI Layouts
N/A - This module is strictly backend. However, it exposes a contract-first OpenAPI specification (`openapi/spec.yaml`) that drives automated client code generation for the Web and Android applications.

## Backend API & Functions
- **Framework**: ASP.NET Core WebAPI (.NET 10) utilizing Minimal APIs.
- **Architecture**: Vertical Slice architecture utilizing MediatR for CQRS and FluentValidation for request validation.
- **Core Functions**: 
  - Intercepts requests to resolve tenant context from JWT claims.
  - Exposes endpoints for inventory management, task distribution, and event ingestion.
  - Computes current stock levels dynamically by replaying `Movement` records (event sourcing-like pattern) rather than maintaining a static stock table.

## Data Sources & SQL Flow
- **ORM**: EF Core configured with global query filters applied automatically based on the resolved `tenant_id`.
- **Flow**: Incoming HTTP requests are validated, tenant context is extracted from the JWT, and EF Core ensures strict data isolation. Read operations for stock trigger queries against the `Movement` ledger to compute real-time availability.

## Impact Analysis
- **Task Impact**: Greenfield creation of the API structure. Requires implementing vertical slices for core WMS features (putaway, picking, receiving, stock counts). Must implement capability flags on products to allow industry-agnostic behavior (e.g., lot/expiry tracking, quarantine) without requiring separate schemas per vertical.