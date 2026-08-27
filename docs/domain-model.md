# Domain Model (v1)

This is the initial entity design implied by [architecture.md](architecture.md). It's a starting point for scaffolding, not a frozen schema — expect it to be refined once implementation starts. See [glossary.md](glossary.md) for term definitions.

## Design principles behind this shape

1. **Barcode is a lookup, not an identifier.** The same barcode can legitimately map to more than one thing (shared EAN across variants, reused codes across pack levels). `Item`/`ItemUnit`/`Barcode` are three separate entities so ambiguity is representable instead of forcing a false 1:1.
2. **Industry differences are flags on `Item`, not different schemas.** No `PharmaItem` / `ElectronicsItem` split — see [architecture.md](architecture.md#product-modeling-generic-core-no-per-industry-schema) for why.
3. **Stock balance is derived, never stored as a directly-mutated counter.** `Movement` is an append-only ledger; on-hand quantity per bin/lot is a query over it. This is what makes the offline sync model (see [sync-protocol.md](sync-protocol.md)) tractable — the backend applies deltas, it never merges two conflicting snapshots.
4. **Every tenant-owned table carries `tenant_id`**, enforced by both an EF Core global query filter and a Postgres RLS policy.

## Entity overview

```mermaid
erDiagram
    TENANT ||--o{ ITEM : owns
    TENANT ||--o{ LOCATION : owns
    TENANT ||--o{ USER_ACCOUNT : owns
    TENANT ||--o{ TASK : owns

    ITEM ||--o{ ITEM_UNIT : "has pack levels"
    ITEM_UNIT ||--o{ BARCODE : "identified by"
    ITEM_UNIT ||--o{ MOVEMENT : "moved as"

    LOCATION ||--o{ LOCATION : "parent of"
    LOCATION ||--o{ MOVEMENT : "from/to"

    TASK ||--o{ TASK_EVENT : "reports"
    TASK_EVENT ||--o{ MOVEMENT : "produces"

    ITEM ||--o{ LOT : "tracked as (if tracksLot)"
    ITEM ||--o{ SERIAL_UNIT : "tracked as (if tracksSerial)"
    LOT ||--o{ MOVEMENT : "referenced by"
    SERIAL_UNIT ||--o{ MOVEMENT : "referenced by"

    USER_ACCOUNT ||--o{ TASK : "assigned"

    TENANT {
        uuid id PK
        string name
    }

    ITEM {
        uuid id PK
        uuid tenant_id FK
        string name
        string variant_label
        bool tracks_lot
        bool tracks_expiry
        bool tracks_serial
    }

    ITEM_UNIT {
        uuid id PK
        uuid item_id FK
        string level_name "each, sachet, box, pallet, ..."
        decimal conversion_to_base
        int pack_order "0 = base unit"
    }

    BARCODE {
        uuid id PK
        uuid tenant_id FK
        uuid item_unit_id FK
        string code
        string symbology "EAN13, CODE128, GS1_128, QR, ..."
    }

    LOCATION {
        uuid id PK
        uuid tenant_id FK
        uuid parent_location_id FK "nullable"
        string name
        string level_type "warehouse, zone, aisle, rack, bin"
    }

    LOT {
        uuid id PK
        uuid tenant_id FK
        uuid item_id FK
        string lot_number
        date expiry_date
        date manufactured_date "nullable"
    }

    SERIAL_UNIT {
        uuid id PK
        uuid tenant_id FK
        uuid item_id FK
        string serial_number
        string status
        uuid current_location_id FK
    }

    TASK {
        uuid id PK
        uuid tenant_id FK
        string type "Pick, Putaway, Count, ReceiptCheck"
        string status "Pending, Assigned, InProgress, Completed, Exception"
        uuid assigned_user_id FK "nullable"
        uuid assigned_device_id FK "nullable"
        timestamptz downloaded_at "nullable — reservation anchor"
    }

    TASK_EVENT {
        uuid id PK
        uuid client_event_id "client-generated UUID, idempotency key"
        uuid task_id FK
        string type "ScanOut, ScanIn, CountResult, Exception, ..."
        jsonb payload
        timestamptz device_occurred_at "audit only, not trusted for ordering"
        timestamptz server_received_at "authoritative ordering"
    }

    MOVEMENT {
        uuid id PK
        uuid tenant_id FK
        uuid item_unit_id FK
        uuid lot_id FK "nullable"
        uuid serial_unit_id FK "nullable"
        uuid from_location_id FK "nullable"
        uuid to_location_id FK "nullable"
        decimal quantity
        string inventory_status "Available, OnHold, Quarantined, Damaged, Expired"
        uuid source_task_event_id FK
        timestamptz server_received_at
    }

    USER_ACCOUNT {
        uuid id PK
        uuid tenant_id FK
        string name
        string role
    }
```

## Notes on specific entities

- **`ItemUnit.pack_order`**: `0` is always the base (stock-keeping) unit; higher numbers are larger packs. Depth is per-item, not fixed — a tenant might have only `each`/`box`, another `each`/`sachet`/`box`/`pallet`.
- **`Barcode` is deliberately not unique** on `(tenant_id, code)`. Resolving an ambiguous scan (same code → multiple `ItemUnit`s) is application logic: narrow by the active Task's expected items first, then prompt the operator.
- **`Lot` and `SerialUnit` are optional bolt-ons**, populated only for items with the corresponding flag set. A tenant that never uses lot tracking has zero rows in `Lot` — no schema difference, no dead columns.
- **`Task.downloaded_at`** is the reservation anchor: stock relevant to a `PickTask` is soft-reserved at the moment the task is downloaded to a device (`SELECT ... FOR UPDATE SKIP LOCKED`), not when the task is created — this is what lets multiple PDTs work the same warehouse concurrently without double-allocating the same stock.
- **`TaskEvent.client_event_id`** is how sync is idempotent: replaying a sync batch (e.g. after a dropped connection mid-upload) is safe because the backend has already recorded that event ID.
- **`Movement` has no `quantity_after` or running balance column.** On-hand stock is always computed by summing `Movement` rows for a given `item_unit`/`lot`/`location` — this is what avoids merge-conflict logic entirely; the backend only ever appends.

## Open modeling questions

Not yet decided — flag before implementing the affected area:

- Exact `Location` hierarchy depth/labels: fixed 5-level (warehouse/zone/aisle/rack/bin) or fully tenant-configurable?
- Whether `SerialUnit.status` needs its own state machine beyond reusing `InventoryStatus`.
- UoM: are fractional/decimal quantities and catch-weight items in scope for v1, or integer-only?
