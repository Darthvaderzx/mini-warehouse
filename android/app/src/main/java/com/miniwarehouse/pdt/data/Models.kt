package com.miniwarehouse.pdt.data

import java.util.UUID

enum class TaskType { Pick, Putaway, Count, ReceiptCheck }
enum class TaskStatus { Pending, Assigned, InProgress, Completed, Exception }
enum class TaskEventType { ScanLocation, ScanItem, ConfirmQuantity, ShortPick, CountResult, Exception }

data class PdtTask(
    val id: UUID,
    val tenantId: UUID,
    val type: TaskType,
    val status: TaskStatus,
    val title: String,
    val referenceDoc: String?,
    val lines: List<PdtTaskLine>
)

data class PdtTaskLine(
    val id: UUID,
    val taskId: UUID,
    val itemId: UUID,
    val itemSku: String,
    val itemName: String,
    val expectedQty: Double,
    var completedQty: Double,
    val sourceLocation: String?,
    val destLocation: String?
)

data class PdtTaskEvent(
    val clientEventId: UUID = UUID.randomUUID(),
    val taskId: UUID,
    val taskLineId: UUID?,
    val type: TaskEventType,
    val scannedBarcode: String?,
    val scannedLocationBarcode: String?,
    val qtyScanned: Double,
    val deviceOccurredAt: String
)
