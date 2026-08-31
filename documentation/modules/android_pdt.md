# Android PDT Module

## Frontend/UI Layouts
- **Framework**: Kotlin with Jetpack Compose for a modern, declarative UI.
- **Layouts**: 
  - Task queue dashboard showing assigned floor operations.
  - Dedicated scanning and execution screens for putaway, picking, receiving, and stock counts.
  - Offline status indicators and sync progress overlays.
  - Hardware-optimized layouts for handheld scanners (PDTs) with large touch targets and physical button integration.

## Backend API & Functions
- **Sync Engine**: Manages the offline task queue and event ledger pattern. Pulls tasks from the backend when online and pushes batched events back.
- **Context Resolution**: Handles non-unique barcodes by resolving them through contextual UI flows (e.g., prompting the user to select the correct product or location if multiple matches exist).

## Data Sources & SQL Flow
- **Local Storage**: Local SQLite/Room database to store tasks, cached inventory, and pending outbound events while offline.
- **Data Flow**: 
  1. App pulls tasks and caches them locally.
  2. User performs floor operations; actions are recorded as local events.
  3. App syncs event batches to the backend when connectivity is restored.

## Impact Analysis
- **Task Impact**: Greenfield creation of the Android application. Requires implementing the offline-first architecture, local database schema, and the robust sync mechanism to ensure no data loss during floor operations. Must also build the contextual barcode resolution UI.