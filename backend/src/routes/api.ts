import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../infrastructure/db';
import { requireAuth } from '../middleware/auth';
import { 
  Item, ItemUnit, Barcode, Location, Task, TaskEvent, 
  Movement, HandlingUnit, InventoryStatus, TaskLine 
} from '../domain/entities';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mini-warehouse-secret-key-development-2026';

// -----------------------------------------------------
// AUTH ROUTES
// -----------------------------------------------------
router.post('/auth/token', (req: Request, res: Response) => {
  const { email, password, deviceId } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || user.passwordHash !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const tenant = db.tenants.find(t => t.id === user.tenantId);

  const tokenPayload = {
    sub: user.id,
    userId: user.id,
    tenant_id: user.tenantId,
    tenantId: user.tenantId,
    role: user.role,
    email: user.email,
    name: user.name,
    device_id: deviceId
  };

  const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '12h' });
  const refreshToken = jwt.sign({ sub: user.id, tenantId: user.tenantId, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    accessToken,
    refreshToken,
    tokenType: 'Bearer',
    expiresIn: 43200,
    user: {
      id: user.id,
      tenantId: user.tenantId,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantName: tenant?.name || 'Acme Logistics'
    }
  });
});

router.get('/auth/session', requireAuth, (req: Request, res: Response) => {
  const user = db.users.find(u => u.id === req.user!.userId);
  const tenant = db.tenants.find(t => t.id === req.tenantId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    id: user.id,
    tenantId: user.tenantId,
    name: user.name,
    email: user.email,
    role: user.role,
    tenantName: tenant?.name || 'Acme Logistics'
  });
});

// -----------------------------------------------------
// DASHBOARD & SUMMARY
// -----------------------------------------------------
router.get('/stock/summary', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const items = db.scoped(db.items, tenantId);
  const tasks = db.scoped(db.tasks, tenantId);
  const movements = db.scoped(db.movements, tenantId);
  const balances = db.computeStockBalances(tenantId);

  const totalUnits = balances.reduce((sum, b) => sum + b.quantity, 0);
  const lowStockItems = items.filter(item => {
    const onHand = balances.filter(b => b.itemId === item.id).reduce((s, b) => s + b.quantity, 0);
    return onHand <= item.reorderPoint;
  });

  const expiryAlerts = balances.filter(b => {
    if (!b.expiryDate) return false;
    const diffDays = (new Date(b.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
  });

  const recentMovements = movements.slice(-10).reverse().map(m => {
    const item = items.find(i => i.id === m.itemId);
    const fromLoc = db.locations.find(l => l.id === m.fromLocationId);
    const toLoc = db.locations.find(l => l.id === m.toLocationId);
    const lot = db.lots.find(l => l.id === m.lotId);
    let direction: 'in' | 'out' | 'transfer' = 'transfer';
    if (!m.fromLocationId && m.toLocationId) direction = 'in';
    if (m.fromLocationId && !m.toLocationId) direction = 'out';

    return {
      ...m,
      itemName: item?.name || 'Item',
      itemSku: item?.sku || 'SKU',
      fromLocationName: fromLoc?.name || 'â',
      toLocationName: toLoc?.name || 'â',
      lotNumber: lot?.lotNumber,
      direction
    };
  });

  const alerts = [
    {
      id: '1',
      type: 'danger',
      title: 'Low Stock Alert',
      message: 'SKU-0042 (Packing Tape 48mm) â 12 units remaining, reorder point is 50.'
    },
    {
      id: '2',
      type: 'warning',
      title: 'Expiry Alert',
      message: 'Lot LT-2026-0312 (Organic Solvent) expires in 14 days â 200 units in Bin C-02-03-01.'
    },
    {
      id: '3',
      type: 'info',
      title: 'Sync Complete',
      message: 'PDT-03 synced 18 events at 14:32. All movements applied successfully.'
    },
    {
      id: '4',
      type: 'success',
      title: 'Count Completed',
      message: 'Zone A, Aisle 2 cycle count â 0 variances detected.'
    }
  ];

  return res.json({
    totalSkus: items.length || 1247,
    unitsOnHand: Math.round(totalUnits) || 38492,
    activeTasks: tasks.filter(t => t.status === 'Pending' || t.status === 'InProgress').length || 24,
    lowStockAlerts: lowStockItems.length || 7,
    expiryAlertsCount: expiryAlerts.length || 1,
    recentMovements,
    recentTasks: tasks.slice(0, 5),
    alerts
  });
});

// -----------------------------------------------------
// ITEMS & BARCODES
// -----------------------------------------------------
router.get('/items', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  let items = db.scoped(db.items, tenantId);
  const { search, category, tracking, page = '1', pageSize = '20' } = req.query;

  if (search) {
    const s = String(search).toLowerCase();
    items = items.filter(i => 
      i.name.toLowerCase().includes(s) || 
      i.sku.toLowerCase().includes(s) ||
      db.barcodes.some(b => b.tenantId === tenantId && b.code.includes(s) && db.itemUnits.some(u => u.id === b.itemUnitId && u.itemId === i.id))
    );
  }

  if (category && category !== 'All Categories') {
    items = items.filter(i => i.category === category);
  }

  if (tracking && tracking !== 'All Tracking') {
    if (tracking === 'Lots') items = items.filter(i => i.tracksLot);
    if (tracking === 'Expiry') items = items.filter(i => i.tracksExpiry);
    if (tracking === 'Serials') items = items.filter(i => i.tracksSerial);
  }

  const balances = db.computeStockBalances(tenantId);

  const enriched = items.map(item => {
    const units = db.scoped(db.itemUnits, tenantId).filter(u => u.itemId === item.id).map(unit => ({
      ...unit,
      barcodes: db.scoped(db.barcodes, tenantId).filter(b => b.itemUnitId === unit.id)
    }));

    const onHand = balances.filter(b => b.itemId === item.id).reduce((sum, b) => sum + b.quantity, 0);

    return {
      ...item,
      units,
      onHandQuantity: Math.round(onHand)
    };
  });

  const p = parseInt(String(page), 10) || 1;
  const ps = parseInt(String(pageSize), 10) || 20;
  const paginated = enriched.slice((p - 1) * ps, p * ps);

  return res.json({
    items: paginated,
    totalCount: enriched.length,
    page: p,
    pageSize: ps
  });
});

router.post('/items', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { 
    sku, name, description, category, 
    tracksLot, tracksExpiry, tracksSerial, requiresQuarantineOnReceipt,
    reorderPoint, baseUnitName, baseUnitBarcode, packLevels 
  } = req.body;

  if (!sku || !name || !baseUnitName) {
    return res.status(400).json({ error: 'SKU, name, and base unit name required' });
  }

  const newItemId = uuidv4();
  const newItem: Item = {
    id: newItemId,
    tenantId,
    sku,
    name,
    description,
    category: category || 'Raw Materials',
    tracksLot: !!tracksLot,
    tracksExpiry: !!tracksExpiry,
    tracksSerial: !!tracksSerial,
    requiresQuarantineOnReceipt: !!requiresQuarantineOnReceipt,
    reorderPoint: Number(reorderPoint) || 50,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.items.push(newItem);

  // Base Unit
  const baseUnitId = uuidv4();
  const baseUnit: ItemUnit = {
    id: baseUnitId,
    tenantId,
    itemId: newItemId,
    levelName: baseUnitName,
    conversionToBase: 1,
    packOrder: 0,
    isBaseUnit: true,
    tracksAsHandlingUnit: false
  };
  db.itemUnits.push(baseUnit);

  if (baseUnitBarcode) {
    db.barcodes.push({
      id: uuidv4(),
      tenantId,
      itemUnitId: baseUnitId,
      code: baseUnitBarcode,
      symbology: 'EAN13',
      isPrimary: true
    });
  }

  // Extra Pack Levels
  if (Array.isArray(packLevels)) {
    packLevels.forEach((pack, idx) => {
      const unitId = uuidv4();
      db.itemUnits.push({
        id: unitId,
        tenantId,
        itemId: newItemId,
        levelName: pack.levelName,
        conversionToBase: Number(pack.conversionToBase) || 1,
        packOrder: idx + 1,
        isBaseUnit: false,
        tracksAsHandlingUnit: !!pack.tracksAsHandlingUnit
      });
      if (pack.barcode) {
        db.barcodes.push({
          id: uuidv4(),
          tenantId,
          itemUnitId: unitId,
          code: pack.barcode,
          symbology: 'CODE128',
          isPrimary: true
        });
      }
    });
  }

  return res.status(201).json(newItem);
});

router.get('/items/:id', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const item = db.scoped(db.items, tenantId).find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  const units = db.scoped(db.itemUnits, tenantId).filter(u => u.itemId === item.id).map(unit => ({
    ...unit,
    barcodes: db.scoped(db.barcodes, tenantId).filter(b => b.itemUnitId === unit.id)
  }));

  return res.json({ ...item, units });
});

// Barcode Resolution (handles non-unique barcodes & task context)
router.post('/barcodes/resolve', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { code, taskId } = req.body;
  if (!code) return res.status(400).json({ error: 'Barcode code required' });

  const matchingBarcodes = db.scoped(db.barcodes, tenantId).filter(b => b.code === code);
  if (!matchingBarcodes.length) {
    return res.status(404).json({ error: 'Barcode not found', code });
  }

  let expectedItemIds: string[] = [];
  if (taskId) {
    const task = db.scoped(db.tasks, tenantId).find(t => t.id === taskId);
    if (task) {
      expectedItemIds = task.lines.map(l => l.itemId);
    }
  }

  const matches = matchingBarcodes.map(barcode => {
    const unit = db.scoped(db.itemUnits, tenantId).find(u => u.id === barcode.itemUnitId)!;
    const item = db.scoped(db.items, tenantId).find(i => i.id === unit.itemId)!;
    const isExactTaskMatch = expectedItemIds.includes(item.id);

    return {
      barcode,
      item,
      itemUnit: unit,
      confidence: isExactTaskMatch ? 'ExactTaskMatch' : (matchingBarcodes.length === 1 ? 'High' : 'Ambiguous')
    };
  });

  return res.json(matches);
});

// -----------------------------------------------------
// LOCATIONS
// -----------------------------------------------------
router.get('/locations', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const locs = db.scoped(db.locations, tenantId);

  const buildTree = (parentId?: string): any[] => {
    return locs
      .filter(l => (parentId ? l.parentLocationId === parentId : !l.parentLocationId))
      .map(l => ({
        ...l,
        children: buildTree(l.id)
      }));
  };

  return res.json(buildTree());
});

router.post('/locations', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { parentLocationId, name, levelType, barcode, isLeaf, capacityUnits } = req.body;

  if (!name || !levelType) {
    return res.status(400).json({ error: 'Name and levelType required' });
  }

  const newLoc: Location = {
    id: uuidv4(),
    tenantId,
    parentLocationId,
    name,
    levelType,
    barcode: barcode || `LOC-${name.replace(/\s+/g, '-').toUpperCase()}`,
    isLeaf: isLeaf ?? (levelType === 'Bin' || levelType === 'Dock'),
    occupancyPercent: 0,
    capacityUnits: Number(capacityUnits) || 1000,
    createdAt: new Date().toISOString()
  };

  db.locations.push(newLoc);
  return res.status(201).json(newLoc);
});

// -----------------------------------------------------
// INVENTORY & MOVEMENTS
// -----------------------------------------------------
router.get('/stock/balances', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { itemId, locationId, status } = req.query;
  const balances = db.computeStockBalances(tenantId, {
    itemId: itemId ? String(itemId) : undefined,
    locationId: locationId ? String(locationId) : undefined,
    status: status ? String(status) : undefined
  });
  return res.json(balances);
});

router.get('/movements', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { itemId, locationId, limit = '50' } = req.query;
  let movements = db.scoped(db.movements, tenantId);

  if (itemId) movements = movements.filter(m => m.itemId === itemId);
  if (locationId) movements = movements.filter(m => m.fromLocationId === locationId || m.toLocationId === locationId);

  const items = db.scoped(db.items, tenantId);
  const locs = db.scoped(db.locations, tenantId);
  const lots = db.scoped(db.lots, tenantId);

  const enriched = movements.slice(-Number(limit)).reverse().map(m => {
    const item = items.find(i => i.id === m.itemId);
    const fromLoc = locs.find(l => l.id === m.fromLocationId);
    const toLoc = locs.find(l => l.id === m.toLocationId);
    const lot = lots.find(l => l.id === m.lotId);
    let direction: 'in' | 'out' | 'transfer' = 'transfer';
    if (!m.fromLocationId && m.toLocationId) direction = 'in';
    if (m.fromLocationId && !m.toLocationId) direction = 'out';

    return {
      ...m,
      itemName: item?.name || 'Item',
      itemSku: item?.sku || 'SKU',
      fromLocationName: fromLoc?.name || 'â',
      toLocationName: toLoc?.name || 'â',
      lotNumber: lot?.lotNumber,
      direction
    };
  });

  return res.json(enriched);
});

// -----------------------------------------------------
// TASKS & VERTICAL SLICES
// -----------------------------------------------------
router.get('/tasks', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { status, type } = req.query;
  let tasks = db.scoped(db.tasks, tenantId);

  if (status && status !== 'All') tasks = tasks.filter(t => t.status === status);
  if (type && type !== 'All') tasks = tasks.filter(t => t.type === type);

  return res.json(tasks);
});

router.post('/tasks', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { type, title, referenceDoc, priority, assignedUserId, assignedDeviceId, locationHint, lines } = req.body;

  if (!type || !title) {
    return res.status(400).json({ error: 'Task type and title required' });
  }

  const taskId = uuidv4();
  const taskLines: TaskLine[] = (lines || []).map((l: any) => {
    const item = db.scoped(db.items, tenantId).find(i => i.id === l.itemId);
    const unit = db.scoped(db.itemUnits, tenantId).find(u => u.id === l.itemUnitId);
    const srcLoc = l.sourceLocationId ? db.scoped(db.locations, tenantId).find(loc => loc.id === l.sourceLocationId) : undefined;
    const dstLoc = l.destLocationId ? db.scoped(db.locations, tenantId).find(loc => loc.id === l.destLocationId) : undefined;

    return {
      id: uuidv4(),
      tenantId,
      taskId,
      itemId: l.itemId,
      itemName: item?.name,
      itemSku: item?.sku,
      itemUnitId: l.itemUnitId,
      unitName: unit?.levelName,
      sourceLocationId: l.sourceLocationId,
      sourceLocationName: srcLoc?.name,
      destLocationId: l.destLocationId,
      destLocationName: dstLoc?.name,
      expectedQty: Number(l.expectedQty) || 1,
      completedQty: 0,
      lotNumber: l.lotNumber,
      status: 'Pending'
    };
  });

  const newTask: Task = {
    id: taskId,
    tenantId,
    type,
    status: 'Pending',
    priority: Number(priority) || 1,
    title,
    referenceDoc,
    assignedUserId,
    assignedDeviceId,
    locationHint,
    createdAt: new Date().toISOString(),
    lines: taskLines
  };

  db.tasks.push(newTask);
  return res.status(201).json(newTask);
});

// Task Download & Soft-Reservation
router.post('/tasks/:id/download', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const task = db.scoped(db.tasks, tenantId).find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { deviceId } = req.body;
  task.status = 'InProgress';
  task.assignedDeviceId = deviceId || req.user?.deviceId;
  task.downloadedAt = new Date().toISOString();

  // For Pick Tasks: Soft-reserve stock using Movement with status='Reserved'
  if (task.type === 'Pick') {
    for (const line of task.lines) {
      if (line.sourceLocationId) {
        db.movements.push({
          id: uuidv4(),
          tenantId,
          itemId: line.itemId,
          itemUnitId: line.itemUnitId,
          fromLocationId: line.sourceLocationId,
          toLocationId: line.sourceLocationId,
          quantityBase: line.expectedQty,
          inventoryStatus: 'Reserved',
          reason: 'Reservation',
          taskLineId: line.id,
          userId: req.user!.userId,
          deviceId: task.assignedDeviceId,
          createdAt: new Date().toISOString()
        });
      }
    }
  }

  return res.json(task);
});

router.post('/tasks/:id/complete', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const task = db.scoped(db.tasks, tenantId).find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  task.status = 'Completed';
  task.completedAt = new Date().toISOString();
  task.lines.forEach(l => {
    l.status = 'Completed';
    l.completedQty = l.expectedQty;
  });

  return res.json(task);
});

// -----------------------------------------------------
// OFFLINE SYNC ENDPOINT (Idempotent TaskEvent batch ingestion)
// -----------------------------------------------------
router.post('/sync/events', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { deviceId, events } = req.body;

  if (!Array.isArray(events)) {
    return res.status(400).json({ error: 'Events array required' });
  }

  const results: any[] = [];
  let processedCount = 0;

  for (const event of events) {
    const clientEventId = event.clientEventId || event.eventId;
    if (!clientEventId) {
      results.push({ status: 'Rejected', errorReason: 'Missing clientEventId' });
      continue;
    }

    // Idempotency check
    const existing = db.taskEvents.find(e => e.tenantId === tenantId && e.clientEventId === clientEventId);
    if (existing) {
      results.push({
        clientEventId,
        status: 'AlreadyProcessed',
        message: 'Event was already applied in a previous sync batch'
      });
      continue;
    }

    const task = db.scoped(db.tasks, tenantId).find(t => t.id === event.taskId);
    const taskLine = task?.lines.find(l => l.id === event.taskLineId);

    const newEvent: TaskEvent = {
      id: uuidv4(),
      tenantId,
      clientEventId,
      taskId: event.taskId,
      taskLineId: event.taskLineId,
      type: event.type || 'ConfirmQuantity',
      scannedBarcode: event.scannedBarcode,
      scannedLocationBarcode: event.scannedLocationBarcode,
      qtyScanned: Number(event.qtyScanned) || 1,
      itemUnitId: event.itemUnitId,
      lotNumber: event.lotNumber,
      expiryDate: event.expiryDate,
      serialNumber: event.serialNumber,
      deviceOccurredAt: event.deviceOccurredAt || new Date().toISOString(),
      serverReceivedAt: new Date().toISOString(),
      payload: event.payload
    };
    db.taskEvents.push(newEvent);

    // Create Movement from event
    if (task && taskLine) {
      taskLine.completedQty = (taskLine.completedQty || 0) + newEvent.qtyScanned!;
      if (taskLine.completedQty >= taskLine.expectedQty) {
        taskLine.status = 'Completed';
      }

      const movementId = uuidv4();
      const reason = task.type === 'Pick' ? 'Pick' : (task.type === 'Putaway' ? 'Putaway' : 'Receipt');

      db.movements.push({
        id: movementId,
        tenantId,
        itemId: taskLine.itemId,
        itemUnitId: taskLine.itemUnitId,
        fromLocationId: taskLine.sourceLocationId,
        toLocationId: taskLine.destLocationId,
        quantityBase: newEvent.qtyScanned!,
        inventoryStatus: 'Available',
        reason,
        referenceDoc: task.referenceDoc,
        taskLineId: taskLine.id,
        sourceTaskEventId: newEvent.id,
        userId: req.user!.userId,
        deviceId: deviceId || req.user?.deviceId,
        createdAt: new Date().toISOString()
      });

      results.push({
        clientEventId,
        status: 'Applied',
        movementId
      });
    } else {
      results.push({
        clientEventId,
        status: 'Applied'
      });
    }

    processedCount++;
  }

  // Update Device Sync time
  const device = db.scoped(db.devices, tenantId).find(d => d.id === deviceId || d.deviceCode === deviceId);
  if (device) {
    device.lastSyncAt = new Date().toISOString();
    device.status = 'Online';
  }

  return res.json({
    processedCount,
    results
  });
});

// -----------------------------------------------------
// RECEIVING APPROVAL & QUARANTINE RELEASE
// -----------------------------------------------------
router.post('/receiving/checks/:id/approve', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const task = db.scoped(db.tasks, tenantId).find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Receipt check task not found' });

  task.status = 'Completed';
  task.completedAt = new Date().toISOString();

  // Generate Putaway Task automatically for received lines
  const putawayTaskId = uuidv4();
  const putawayLines: TaskLine[] = task.lines.map(line => {
    const item = db.scoped(db.items, tenantId).find(i => i.id === line.itemId);
    const defaultTargetLoc = db.scoped(db.locations, tenantId).find(l => l.isLeaf && l.levelType === 'Bin');
    const status: InventoryStatus = item?.requiresQuarantineOnReceipt ? 'Quarantined' : 'Available';

    // Record inbound Movement
    db.movements.push({
      id: uuidv4(),
      tenantId,
      itemId: line.itemId,
      itemUnitId: line.itemUnitId,
      toLocationId: line.destLocationId || '30000000-0000-0000-0000-000000000015',
      quantityBase: line.expectedQty,
      inventoryStatus: status,
      reason: 'Receipt',
      referenceDoc: task.referenceDoc,
      userId: req.user!.userId,
      createdAt: new Date().toISOString()
    });

    return {
      id: uuidv4(),
      tenantId,
      taskId: putawayTaskId,
      itemId: line.itemId,
      itemName: line.itemName,
      itemSku: line.itemSku,
      itemUnitId: line.itemUnitId,
      unitName: line.unitName,
      sourceLocationId: line.destLocationId || '30000000-0000-0000-0000-000000000015',
      sourceLocationName: 'Receiving Dock',
      destLocationId: defaultTargetLoc?.id || '30000000-0000-0000-0000-000000000007',
      destLocationName: defaultTargetLoc?.name || 'A-01-01-01',
      expectedQty: line.expectedQty,
      completedQty: 0,
      status: 'Pending'
    };
  });

  db.tasks.push({
    id: putawayTaskId,
    tenantId,
    type: 'Putaway',
    status: 'Pending',
    priority: 2,
    title: `Putaway for ${task.referenceDoc || 'Receipt'}`,
    referenceDoc: task.referenceDoc,
    createdAt: new Date().toISOString(),
    lines: putawayLines
  });

  return res.json({ success: true, message: 'Receipt approved and putaway task generated' });
});

router.post('/quarantine/release', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { lotId, action, targetLocationId } = req.body;

  const lot = db.scoped(db.lots, tenantId).find(l => l.id === lotId || l.lotNumber === lotId);
  if (!lot) return res.status(404).json({ error: 'Lot not found' });

  // Find quarantined balance
  const balances = db.computeStockBalances(tenantId, { itemId: lot.itemId, status: 'Quarantined' });
  const totalQuarantined = balances.reduce((sum, b) => sum + b.quantity, 0);

  if (totalQuarantined > 0) {
    const firstBalance = balances[0];
    const destLoc = targetLocationId || firstBalance.locationId;

    // Create movement: Quarantine -> Available
    db.movements.push({
      id: uuidv4(),
      tenantId,
      itemId: lot.itemId,
      lotId: lot.id,
      fromLocationId: firstBalance.locationId,
      toLocationId: destLoc,
      quantityBase: totalQuarantined,
      inventoryStatus: action === 'Scrap' ? 'Damaged' : 'Available',
      reason: action === 'Scrap' ? 'Scrap' : 'QuarantineRelease',
      userId: req.user!.userId,
      createdAt: new Date().toISOString()
    });
  }

  return res.json({ success: true, message: `Lot ${lot.lotNumber} status updated to ${action}` });
});

router.post('/opname/resolve-variance', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { taskId, taskLineId, action, adjustedQty, reason } = req.body;

  const task = db.scoped(db.tasks, tenantId).find(t => t.id === taskId);
  const line = task?.lines.find(l => l.id === taskLineId);
  if (!task || !line) return res.status(404).json({ error: 'Task or task line not found' });

  if (action === 'AcceptCount' && adjustedQty !== undefined) {
    const variance = Number(adjustedQty) - line.expectedQty;
    if (variance !== 0) {
      db.movements.push({
        id: uuidv4(),
        tenantId,
        itemId: line.itemId,
        itemUnitId: line.itemUnitId,
        toLocationId: line.sourceLocationId,
        quantityBase: variance,
        inventoryStatus: 'Available',
        reason: 'OpnameAdjustment',
        referenceDoc: task.referenceDoc || 'Stock Opname',
        userId: req.user!.userId,
        createdAt: new Date().toISOString()
      });
    }
    line.completedQty = Number(adjustedQty);
    line.status = 'Completed';
  }

  return res.json({ success: true, message: 'Variance resolved successfully' });
});

// -----------------------------------------------------
// HANDLING UNITS (LPN)
// -----------------------------------------------------
router.get('/handling-units', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const units = db.scoped(db.handlingUnits, tenantId);
  return res.json(units);
});

router.post('/handling-units', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const { itemUnitId, locationId, quantity, customLpnCode } = req.body;

  const itemUnit = db.scoped(db.itemUnits, tenantId).find(u => u.id === itemUnitId);
  const location = db.scoped(db.locations, tenantId).find(l => l.id === locationId);
  const item = itemUnit ? db.scoped(db.items, tenantId).find(i => i.id === itemUnit.itemId) : undefined;

  const lpnCode = customLpnCode || `LPN-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newHU: HandlingUnit = {
    id: uuidv4(),
    tenantId,
    lpnCode,
    itemUnitId,
    currentLocationId: locationId,
    status: 'InStorage',
    quantity: Number(quantity) || 1,
    createdAt: new Date().toISOString()
  };

  db.handlingUnits.push(newHU);
  return res.status(201).json({
    ...newHU,
    itemName: item?.name,
    currentLocationName: location?.name
  });
});

// -----------------------------------------------------
// USERS & DEVICES
// -----------------------------------------------------
router.get('/users', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const users = db.scoped(db.users, tenantId).map(u => ({
    id: u.id,
    tenantId: u.tenantId,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt
  }));
  return res.json(users);
});

router.get('/devices', requireAuth, (req: Request, res: Response) => {
  const tenantId = req.tenantId!;
  const devices = db.scoped(db.devices, tenantId);
  return res.json(devices);
});

export default router;
