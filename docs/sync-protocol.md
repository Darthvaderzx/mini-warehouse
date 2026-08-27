# Offline Sync Protocol (v1)

The backend is always the sole source of truth. A PDT never asserts a final state ("this bin now has 40 units") — it reports observations ("I scanned 12 units out of bin A"), and the backend is the only place those observations are turned into stock balances. This is what keeps offline sync tractable: the backend replays an ordered set of deltas, it never merges two conflicting snapshots.

## Model: task queue + append-only event ledger

1. **Task creation & assignment (always online).** The backend creates a `Task` (`PickTask`, `PutawayTask`, `CountTask`, `ReceiptCheckTask`) and assigns it to a user/device. Assignment always happens while the device has connectivity.
2. **Reservation at download, not at creation.** When a `PickTask` (or any task that consumes specific stock) is downloaded to a device, the backend soft-reserves the relevant stock in the same transaction, using `SELECT ... FOR UPDATE SKIP LOCKED` over candidate stock rows. This is required because **concurrent PDTs in the same warehouse are explicitly supported** — a customer may run several pickers on one floor at once — so two devices racing for the same task pool is an expected, frequent case, not an edge case.
3. **Offline execution.** The PDT executes the task with no connectivity: scanning locations, quantities, lots/serials/expiry as required by the item's capability flags. Local state is the device's own concern; nothing about this needs to reach the backend until sync.
4. **Sync back: a batch of immutable `TaskEvent`s.** Each event carries a client-generated UUID (`client_event_id`). On reconnect, the device uploads its event batch. The backend applies each event exactly once — replaying the same batch twice (e.g. after a dropped connection mid-upload) is a safe no-op, because already-seen `client_event_id`s are skipped.
5. **Backend applies events as `Movement` rows**, inside a transaction, in the order the server received them — never in device-reported order.

## What's NOT synced

- Inventory balances. Never pulled or pushed as a value — always derived server-side from `Movement`.
- Master data edits (new items, new locations) don't originate on the PDT. The PDT pulls a read-only cache of master data relevant to its assigned tasks.
- Document-level decisions — accepting a PO, approving a count variance, releasing a quarantine hold — happen on the web app, not the PDT. The PDT's role is confirm the physical action, not make the business decision.

## Clock trust

Device clocks are never trusted for ordering, FIFO/FEFO, or conflict resolution. Every `TaskEvent` carries both:
- `device_occurred_at` — the device's own timestamp, stored for audit/display only.
- `server_received_at` — set when the backend receives the event; this is what drives all business logic.

## Conflict handling

Because the backend only ever appends deltas, most conflict classes that plague state-sync systems don't apply here. The remaining real conflict is:

**Opname/count variance.** A device counts a bin offline; by the time it syncs, other `Movement`s may have posted against that bin (another task completed, an adjustment). The backend does not blindly overwrite on-hand with the offline count. Instead:
- Compute the expected quantity at the time the count was taken (replaying Movements up to that point) vs. the counted quantity.
- If they match modulo movements that happened after the count, apply the count as a `Movement` (adjustment) automatically.
- If there's an unexplained variance, raise an `InventoryAdjustmentException` for a supervisor to review and approve on the web app — never auto-apply an unexplained variance.

**Short-pick.** If a `PickTask`'s reserved stock is no longer available in the expected quantity when the device attempts to execute it (shouldn't normally happen given download-time reservation, but can if a reservation expired — see below), the PDT records a short-pick `TaskEvent` rather than failing. This is a defined, expected outcome, not an error state.

## Reservation expiry

A device that goes offline for an extended period (lost, battery died, left in a locker) and never syncs would otherwise lock its reserved stock forever. Reservations carry a TTL; an expired reservation is released back to the pool and becomes assignable to another task. An ops user can also manually release a stuck reservation. (Exact TTL: not yet decided — depends on real shift-length data.)

## Login

Login is online-only for v1. There is no offline credential cache, device token, or revocation flow to design. A site whose connectivity is unreliable even for login is treated as out of scope for this product — refer to an on-prem/enterprise WMS partner instead of building offline auth to accommodate it.

## Open questions

- Reservation TTL value.
- Exact retry/backoff policy for a sync batch that partially fails server-side validation (is the whole batch rejected, or applied up to the first bad event?).
- Master-data cache staleness limit before the PDT should refuse to start new work.
