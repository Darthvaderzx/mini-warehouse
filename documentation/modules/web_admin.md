# Web Admin Module

## Frontend/UI Layouts
- **Framework**: Next.js utilizing the App Router.
- **UI Components**: `shadcn/ui` for consistent, accessible, and customizable design system components.
- **Layouts**: 
  - Dashboard for high-level warehouse metrics.
  - Inventory and product catalog management screens.
  - Task management and user/tenant administration panels.
  - Responsive layouts optimized for back-office desktop and tablet use.

## Backend API & Functions
- **Authentication**: Backend-for-Frontend (BFF) pattern handling session-based authentication, exchanging sessions for JWTs to call the backend API securely.
- **API Client**: Orval-generated TypeScript clients derived from the backend's OpenAPI spec.
- **State Management**: TanStack Query for server-state management, data fetching, caching, and background synchronization.

## Data Sources & SQL Flow
- **Data Flow**: The Web app does not connect directly to the database. It communicates exclusively with the BFF, which proxies requests to the ASP.NET Core backend API. 
- **Flow**: User session -> BFF -> JWT injection -> Backend API -> PostgreSQL.

## Impact Analysis
- **Task Impact**: Greenfield creation of the Next.js application. Requires setting up the BFF for secure authentication, configuring Orval for API client generation, and building the core back-office UI layouts to manage tenants, products, and monitor warehouse operations.