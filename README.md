# MiniWarehouse

MiniWarehouse is a multi-tenant warehouse management system (WMS) designed for small-scale operators who need robust, offline-capable floor operations with handheld Android scanners (PDTs) and a Next.js back-office web application, backed by a central API service.

## Key Architectural Principles

- **Single Source of Truth**: Stock balances are derived dynamically by replaying the immutable `Movement` event ledger.
- **Dual-Layer Multi-Tenancy**: Scoped by `tenant_id` at both application and database level (PostgreSQL RLS).
- **Offline-First Sync Protocol**: Client operations generate idempotent `TaskEvent`s with client-side UUIDs.
- **Generic Capability Flags**: Products support lot tracking (`tracksLot`), expiry date (`tracksExpiry`), and serial numbers (`tracksSerial`) without vertical-specific schema forks.
- **Flexible Barcodes**: Non-unique barcodes attached to packaging levels (`ItemUnit`), resolved via task context.

---

## Repository Structure

```
/backend     API service (Express / TypeScript / PostgreSQL / Jest)
/web         Next.js Back-Office Web Application (App Router / TypeScript / Jest)
/android     Android handheld scanner app (Kotlin / Jetpack Compose / ML Kit)
/docs        System architecture, domain model, sync protocol, and auth specifications
/documentation Project rules and release changelog
/infra       Docker Compose and container definitions
```

---

## Prerequisites

- **Node.js**: v20.x or later
- **npm**: v10.x or later
- **Docker & Docker Compose** (for containerized deployment)

---

## Installation

### 1. Backend
```bash
cd backend
npm install
```

### 2. Web Application
```bash
cd web
npm install
```

---

## Development Mode

### Run Backend Server
```bash
cd backend
npm run dev
# API listening at http://localhost:5000/api
```

### Run Web Back-Office App
```bash
cd web
npm run dev
# Web application available at http://localhost:3000
```

---

## Production Build

### Build Backend
```bash
cd backend
npm run build
```

### Build Web Application
```bash
cd web
npm run build
```

---

## Running Tests

### Run Backend Tests (Tenant Isolation, Sync Idempotency, Barcode Resolution)
```bash
cd backend
npm test
```

### Run Web Tests
```bash
cd web
npm test
```

---

## Docker Deployment

To build and run all services (PostgreSQL, Backend API, Web App) with Docker Compose:
```bash
cd infra
docker compose up --build
```
