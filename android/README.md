# Android (PDT)

**Phase 4 — not started.** Discovery (Phase 1), Backend (Phase 2), and Web (Phase 3) come first; see [../docs/scope-v1.md](../docs/scope-v1.md#delivery-phases). Module structure and DI approach are intentionally deferred to a dedicated pass once that phase begins.

Kotlin + Jetpack Compose. Not yet scaffolded.

Offline task execution per [../docs/sync-protocol.md](../docs/sync-protocol.md): pull assigned tasks while online, execute offline, sync back an idempotent event batch. Camera + ML Kit scanning for v1, min target API 30 (Android 11); existing manufacturer-auto-detect hardware-scanner app is the reference for a later integration, not required for v1.
