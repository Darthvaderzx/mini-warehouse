# Domain Glossary

WMS vocabulary is inconsistent across vendors and regions. This is the vocabulary this project uses — when in doubt, match these terms in code, API, and UI rather than synonyms.

| Term | Meaning |
|---|---|
| **Tenant** | One customer organization subscribing to the cloud service. All data is scoped to a tenant. |
| **Item** | A distinct trackable/sellable thing, tenant-scoped. A variant (color/size/flavor) is its own Item, not a modifier on a shared Item. |
| **ItemUnit** | One level of an Item's pack hierarchy (e.g. each → sachet → box → pallet), with a conversion factor to the base unit. Depth is arbitrary, not fixed at 3. |
| **Barcode** | A scannable code mapped to an ItemUnit. Not globally unique — the same code can legitimately map to more than one ItemUnit (shared EAN across variants, or reused across pack levels). Scoped per tenant. |
| **GS1-128 / AI** | A barcode format encoding multiple Application Identifiers in one code (e.g. GTIN + lot + expiry + quantity). Parsed into its component fields on scan. |
| **Location** | A physical place stock can occupy: warehouse → zone → aisle → rack → bin, or a subset of that hierarchy per tenant. |
| **Bin** | The lowest-level Location — where stock is actually picked from or put into. |
| **Lot / Batch** | A group of stock sharing a manufacture date, expiry date, or supplier batch. Only tracked for Items with `tracksLot = true`. |
| **Serial** | An individually identified unit (1 physical item = 1 tracked identity), for Items with `tracksSerial = true`. |
| **FEFO** | First-Expired-First-Out — picking allocation strategy used when an Item tracks expiry. |
| **FIFO** | First-In-First-Out — default picking allocation strategy when expiry isn't tracked. |
| **Inbound / Receiving** | Recording stock arriving at the warehouse, typically against a PO or ASN. Decision-level actions (accept/reject, tolerance overrides) happen on the web app; physical confirmation happens on the PDT. |
| **Putaway** | Moving received stock from a staging/receiving area to its storage Location. Backend assigns the task; PDT confirms it was done at the assigned (or a substituted) bin. |
| **Picking** | Removing stock from a Location to fulfill an order. Allocation (which lot/bin) is decided by the backend; the PDT executes and confirms. |
| **Short-pick** | A pick task where the available quantity at the allocated location is less than requested — an expected exception path, not an error state. |
| **Opname / Cycle Count** | Physical inventory count. "Opname" (Indonesian usage) covers both full and partial (cycle) counts in this project. |
| **Quarantine / Hold** | An `InventoryStatus` preventing stock from being allocated or shipped until released (QC failure, recall, damage). |
| **Reservation** | A soft claim on specific stock, made when a Task is downloaded to a device, preventing a second device from being allocated the same stock. |
| **Task** | A unit of work assigned to a device/user (PutawayTask, PickTask, CountTask, ReceiptCheckTask). The PDT's offline unit of work. |
| **TaskEvent** | An immutable, idempotent record of something a device did against a Task (e.g. "scanned qty 12 out of bin A"). The backend replays TaskEvents to update stock — it never accepts a device's computed balance directly. |
| **Movement** | The append-only ledger of stock quantity changes. The source of truth for on-hand balances is derived from Movements, not stored as a mutable counter. |
| **RLS** | Row-Level Security — a Postgres feature enforcing tenant isolation at the database level, as a second guard behind application-level tenant filtering. |
