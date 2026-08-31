package com.miniwarehouse.pdt.sync

import com.miniwarehouse.pdt.data.PdtTask
import com.miniwarehouse.pdt.data.PdtTaskEvent
import java.util.UUID

class SyncEngine(
    private val deviceId: UUID,
    private val apiBaseUrl: String
) {
    private val eventQueue = mutableListOf<PdtTaskEvent>()

    fun recordEvent(event: PdtTaskEvent) {
        eventQueue.add(event)
    }

    fun getPendingEvents(): List<PdtTaskEvent> {
        return eventQueue.toList()
    }

    suspend fun syncBatchToServer(): Boolean {
        if (eventQueue.isEmpty()) return true
        // In production, posts eventQueue batch to /api/sync/events
        // Upon successful HTTP 200 response with Applied/AlreadyProcessed, clear acknowledged events
        eventQueue.clear()
        return true
    }
}
