# Database and Persistence Module

## Frontend/UI Layouts
N/A - This module is strictly data persistence and schema management.

## Backend API & Functions
- **Schema Management**: EF Core Migrations for version-controlling the database schema.
- **Security Configuration**: Setup and execution of PostgreSQL Row Level Security (RLS) policies.
- **Query Configuration**: EF Core `DbContext` configuration to enforce global query filters for multi-tenancy.

## Data Sources & SQL Flow
- **Database Engine**: Single shared PostgreSQL instance.
- **Multi-tenancy**: Every tenant-scoped table includes a `tenant_id` column. Postgres RLS policies enforce isolation at the database engine level, providing a defense-in-depth strategy alongside EF Core global filters.
- **Event Sourcing Schema**: 
  - `Movement` tables act as an immutable event ledger for stock changes.
  - Stock levels are computed by replaying these movements rather than updating a single `Quantity` column.

## Impact Analysis
- **Task Impact**: Greenfield creation of the database schema. Requires designing the initial multi-tenant schema, writing and applying Postgres RLS policies, configuring EF Core global filters, and designing the `Movement` and related tables to support the event-sourcing-like stock computation model.