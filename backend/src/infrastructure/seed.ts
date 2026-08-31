import { 
  Tenant, UserAccount, Device, Item, ItemUnit, Barcode, 
  Location, Lot, SerialUnit, HandlingUnit, Task, TaskEvent, Movement 
} from '../domain/entities';

export function initialSeedData() {
  const tenantId = '00000000-0000-0000-0000-000000000001';
  const tenant2Id = '00000000-0000-0000-0000-000000000002';

  const tenants: Tenant[] = [
    {
      id: tenantId,
      name: 'Acme Logistics',
      code: 'ACME',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: tenant2Id,
      name: 'Beta Warehousing',
      code: 'BETA',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  const users: UserAccount[] = [
    {
      id: '10000000-0000-0000-0000-000000000001',
      tenantId,
      name: 'Admin User',
      email: 'admin@acme.com',
      passwordHash: 'password123',
      role: 'Admin',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: '10000000-0000-0000-0000-000000000002',
      tenantId,
      name: 'Maria Santos',
      email: 'maria@acme.com',
      passwordHash: 'password123',
      role: 'Supervisor',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: '10000000-0000-0000-0000-000000000003',
      tenantId,
      name: 'John Floor',
      email: 'john@acme.com',
      passwordHash: 'password123',
      role: 'Operator',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: '10000000-0000-0000-0000-000000000099',
      tenantId: tenant2Id,
      name: 'Beta User',
      email: 'admin@beta.com',
      passwordHash: 'password123',
      role: 'Admin',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  const devices: Device[] = [
    {
      id: '20000000-0000-0000-0000-000000000001',
      tenantId,
      deviceCode: 'PDT-01',
      name: 'Zebra TC26 #1',
      status: 'InUse',
      lastSyncAt: new Date(Date.now() - 5 * 60000).toISOString(),
      assignedUserId: users[2].id,
      assignedUserName: users[2].name
    },
    {
      id: '20000000-0000-0000-0000-000000000002',
      tenantId,
      deviceCode: 'PDT-02',
      name: 'Honeywell EDA51 #2',
      status: 'Online',
      lastSyncAt: new Date(Date.now() - 15 * 60000).toISOString()
    },
    {
      id: '20000000-0000-0000-0000-000000000003',
      tenantId,
      deviceCode: 'PDT-03',
      name: 'Zebra TC26 #3',
      status: 'InUse',
      lastSyncAt: new Date(Date.now() - 2 * 60000).toISOString(),
      assignedUserId: users[1].id,
      assignedUserName: users[1].name
    }
  ];

  // Locations
  const locWarehouse = '30000000-0000-0000-0000-000000000001';
  const locZoneA = '30000000-0000-0000-0000-000000000002';
  const locZoneB = '30000000-0000-0000-0000-000000000003';
  const locZoneC = '30000000-0000-0000-0000-000000000004';
  const locAisle1 = '30000000-0000-0000-0000-000000000005';
  const locAisle2 = '30000000-0000-0000-0000-000000000006';
  const locBinA0101 = '30000000-0000-0000-0000-000000000007';
  const locBinA0102 = '30000000-0000-0000-0000-000000000008';
  const locBinA0201 = '30000000-0000-0000-0000-000000000009';
  const locBinA010302 = '30000000-0000-0000-0000-000000000010';
  const locBinA030101 = '30000000-0000-0000-0000-000000000011';
  const locBinB020101 = '30000000-0000-0000-0000-000000000012';
  const locBinC010204 = '30000000-0000-0000-0000-000000000013';
  const locBinC020301 = '30000000-0000-0000-0000-000000000014';
  const locDock = '30000000-0000-0000-0000-000000000015';
  const locQuarantine = '30000000-0000-0000-0000-000000000016';

  const locations: Location[] = [
    { id: locWarehouse, tenantId, name: 'Warehouse 1', levelType: 'Warehouse', barcode: 'WH1', isLeaf: false, occupancyPercent: 78, capacityUnits: 100000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locZoneA, tenantId, parentLocationId: locWarehouse, name: 'Zone A â Fast Moving', levelType: 'Zone', barcode: 'LOC-ZA', isLeaf: false, occupancyPercent: 92, capacityUnits: 25000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locZoneB, tenantId, parentLocationId: locWarehouse, name: 'Zone B â Bulk Storage', levelType: 'Zone', barcode: 'LOC-ZB', isLeaf: false, occupancyPercent: 68, capacityUnits: 40000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locZoneC, tenantId, parentLocationId: locWarehouse, name: 'Zone C â Chemical / Hazard', levelType: 'Zone', barcode: 'LOC-ZC', isLeaf: false, occupancyPercent: 45, capacityUnits: 15000, createdAt: '2026-01-01T00:00:00Z' },
    
    { id: locAisle1, tenantId, parentLocationId: locZoneA, name: 'Aisle 1', levelType: 'Aisle', barcode: 'LOC-ZA-A01', isLeaf: false, occupancyPercent: 88, capacityUnits: 6000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locAisle2, tenantId, parentLocationId: locZoneA, name: 'Aisle 2', levelType: 'Aisle', barcode: 'LOC-ZA-A02', isLeaf: false, occupancyPercent: 94, capacityUnits: 6000, createdAt: '2026-01-01T00:00:00Z' },

    { id: locBinA0101, tenantId, parentLocationId: locAisle1, name: 'A-01-01-01', levelType: 'Bin', barcode: 'LOC-A010101', isLeaf: true, occupancyPercent: 60, capacityUnits: 1000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinA0102, tenantId, parentLocationId: locAisle1, name: 'A-01-01-02', levelType: 'Bin', barcode: 'LOC-A010102', isLeaf: true, occupancyPercent: 85, capacityUnits: 1000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinA0201, tenantId, parentLocationId: locAisle1, name: 'A-01-02-01', levelType: 'Bin', barcode: 'LOC-A010201', isLeaf: true, occupancyPercent: 40, capacityUnits: 1000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinA010302, tenantId, parentLocationId: locAisle1, name: 'A-01-03-02', levelType: 'Bin', barcode: 'LOC-A010302', isLeaf: true, occupancyPercent: 75, capacityUnits: 2500, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinA030101, tenantId, parentLocationId: locZoneA, name: 'A-03-01-01', levelType: 'Bin', barcode: 'LOC-A030101', isLeaf: true, occupancyPercent: 30, capacityUnits: 500, createdAt: '2026-01-01T00:00:00Z' },

    { id: locBinB020101, tenantId, parentLocationId: locZoneB, name: 'B-02-01-01', levelType: 'Bin', barcode: 'LOC-B020101', isLeaf: true, occupancyPercent: 70, capacityUnits: 3000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinC010204, tenantId, parentLocationId: locZoneC, name: 'C-01-02-04', levelType: 'Bin', barcode: 'LOC-C010204', isLeaf: true, occupancyPercent: 50, capacityUnits: 1000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locBinC020301, tenantId, parentLocationId: locZoneC, name: 'C-02-03-01', levelType: 'Bin', barcode: 'LOC-C020301', isLeaf: true, occupancyPercent: 65, capacityUnits: 1000, createdAt: '2026-01-01T00:00:00Z' },

    { id: locDock, tenantId, parentLocationId: locWarehouse, name: 'Receiving Dock (STAGING)', levelType: 'Dock', barcode: 'LOC-DOCK-RCV', isLeaf: true, occupancyPercent: 20, capacityUnits: 5000, createdAt: '2026-01-01T00:00:00Z' },
    { id: locQuarantine, tenantId, parentLocationId: locWarehouse, name: 'Quarantine Hold (STAGING)', levelType: 'Dock', barcode: 'LOC-QUARANTINE', isLeaf: true, occupancyPercent: 15, capacityUnits: 2000, createdAt: '2026-01-01T00:00:00Z' }
  ];

  // Items
  const item1 = '40000000-0000-0000-0000-000000000001'; // Steel Bolt M8x40
  const item2 = '40000000-0000-0000-0000-000000000002'; // Organic Solvent 5L (Lot/Exp)
  const item3 = '40000000-0000-0000-0000-000000000003'; // Packing Tape 48mm (Low stock)
  const item4 = '40000000-0000-0000-0000-000000000004'; // Corrugated Box 40x30x20
  const item5 = '40000000-0000-0000-0000-000000000005'; // HDPE Granules (25kg bag)
  const item6 = '40000000-0000-0000-0000-000000000006'; // Bluetooth Module BT-5.0 (Serial)
  const item7 = '40000000-0000-0000-0000-000000000007'; // Stretch Wrap 500mm

  const items: Item[] = [
    {
      id: item1,
      tenantId,
      sku: 'SKU-0001',
      name: 'Steel Bolt M8Ã40',
      description: 'Fastener, Grade 8.8 hex bolt',
      category: 'Raw Materials',
      tracksLot: false,
      tracksExpiry: false,
      tracksSerial: false,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 500,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item2,
      tenantId,
      sku: 'SKU-0015',
      name: 'Organic Solvent 5L',
      description: 'Chemical, flammable class solvent',
      category: 'Raw Materials',
      tracksLot: true,
      tracksExpiry: true,
      tracksSerial: false,
      requiresQuarantineOnReceipt: true,
      reorderPoint: 50,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item3,
      tenantId,
      sku: 'SKU-0042',
      name: 'Packing Tape 48mm Clear',
      description: 'Packaging consumable tape 48mm x 66m',
      category: 'Consumables',
      tracksLot: false,
      tracksExpiry: false,
      tracksSerial: false,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 50,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item4,
      tenantId,
      sku: 'SKU-0058',
      name: 'Corrugated Box 40Ã30Ã20',
      description: 'Standard 3-ply shipping carton',
      category: 'Packaging',
      tracksLot: false,
      tracksExpiry: false,
      tracksSerial: false,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 200,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item5,
      tenantId,
      sku: 'SKU-0103',
      name: 'HDPE Granules (25kg bag)',
      description: 'Polymer raw material injection grade',
      category: 'Raw Materials',
      tracksLot: true,
      tracksExpiry: false,
      tracksSerial: false,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 50,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item6,
      tenantId,
      sku: 'SKU-0210',
      name: 'Bluetooth Module BT-5.0',
      description: 'Electronic component surface mount',
      category: 'Finished Goods',
      tracksLot: false,
      tracksExpiry: false,
      tracksSerial: true,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 100,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    },
    {
      id: item7,
      tenantId,
      sku: 'SKU-0301',
      name: 'Stretch Wrap 500mm',
      description: 'Pallet wrapping film roll 23mic',
      category: 'Consumables',
      tracksLot: false,
      tracksExpiry: false,
      tracksSerial: false,
      requiresQuarantineOnReceipt: false,
      reorderPoint: 20,
      status: 'Active',
      createdAt: '2026-01-01T00:00:00Z'
    }
  ];

  // ItemUnits (Pack Levels)
  const u1Each = '50000000-0000-0000-0000-000000000001';
  const u1Box = '50000000-0000-0000-0000-000000000002';
  const u1Crate = '50000000-0000-0000-0000-000000000003';

  const u2Each = '50000000-0000-0000-0000-000000000004';
  const u2Pallet = '50000000-0000-0000-0000-000000000005';

  const u3Each = '50000000-0000-0000-0000-000000000006';
  const u3Roll = '50000000-0000-0000-0000-000000000007';
  const u3Case = '50000000-0000-0000-0000-000000000008';

  const u4Each = '50000000-0000-0000-0000-000000000009';
  const u4Bundle = '50000000-0000-0000-0000-000000000010';
  const u4Pallet = '50000000-0000-0000-0000-000000000011';

  const u5Bag = '50000000-0000-0000-0000-000000000012';
  const u5Pallet = '50000000-0000-0000-0000-000000000013';

  const u6Each = '50000000-0000-0000-0000-000000000014';
  const u6Tray = '50000000-0000-0000-0000-000000000015';
  const u6Box = '50000000-0000-0000-0000-000000000016';

  const u7Each = '50000000-0000-0000-0000-000000000017';
  const u7Case = '50000000-0000-0000-0000-000000000018';

  const itemUnits: ItemUnit[] = [
    { id: u1Each, tenantId, itemId: item1, levelName: 'Each', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u1Box, tenantId, itemId: item1, levelName: 'Box (50)', conversionToBase: 50, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: false },
    { id: u1Crate, tenantId, itemId: item1, levelName: 'Crate (500)', conversionToBase: 500, packOrder: 2, isBaseUnit: false, tracksAsHandlingUnit: true },

    { id: u2Each, tenantId, itemId: item2, levelName: 'Each (5L)', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u2Pallet, tenantId, itemId: item2, levelName: 'Pallet (40)', conversionToBase: 40, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: true },

    { id: u3Each, tenantId, itemId: item3, levelName: 'Each', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u3Roll, tenantId, itemId: item3, levelName: 'Roll (6)', conversionToBase: 6, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: false },
    { id: u3Case, tenantId, itemId: item3, levelName: 'Case (72)', conversionToBase: 72, packOrder: 2, isBaseUnit: false, tracksAsHandlingUnit: false },

    { id: u4Each, tenantId, itemId: item4, levelName: 'Each', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u4Bundle, tenantId, itemId: item4, levelName: 'Bundle (25)', conversionToBase: 25, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: false },
    { id: u4Pallet, tenantId, itemId: item4, levelName: 'Pallet (500)', conversionToBase: 500, packOrder: 2, isBaseUnit: false, tracksAsHandlingUnit: true },

    { id: u5Bag, tenantId, itemId: item5, levelName: 'Bag (25kg)', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u5Pallet, tenantId, itemId: item5, levelName: 'Pallet (40)', conversionToBase: 40, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: true },

    { id: u6Each, tenantId, itemId: item6, levelName: 'Each', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u6Tray, tenantId, itemId: item6, levelName: 'Tray (20)', conversionToBase: 20, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: false },
    { id: u6Box, tenantId, itemId: item6, levelName: 'Box (200)', conversionToBase: 200, packOrder: 2, isBaseUnit: false, tracksAsHandlingUnit: false },

    { id: u7Each, tenantId, itemId: item7, levelName: 'Each', conversionToBase: 1, packOrder: 0, isBaseUnit: true, tracksAsHandlingUnit: false },
    { id: u7Case, tenantId, itemId: item7, levelName: 'Case (4)', conversionToBase: 4, packOrder: 1, isBaseUnit: false, tracksAsHandlingUnit: false }
  ];

  // Barcodes
  const barcodes: Barcode[] = [
    { id: '60000000-0000-0000-0000-000000000001', tenantId, itemUnitId: u1Each, code: '899100100001', symbology: 'EAN13', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000002', tenantId, itemUnitId: u1Box, code: '899100100050', symbology: 'CODE128', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000003', tenantId, itemUnitId: u2Each, code: '899200200001', symbology: 'EAN13', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000004', tenantId, itemUnitId: u3Each, code: '899300300001', symbology: 'EAN13', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000005', tenantId, itemUnitId: u4Each, code: '899400400001', symbology: 'EAN13', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000006', tenantId, itemUnitId: u5Bag, code: '899500500001', symbology: 'CODE128', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000007', tenantId, itemUnitId: u6Each, code: '899600600001', symbology: 'CODE128', isPrimary: true },
    { id: '60000000-0000-0000-0000-000000000008', tenantId, itemUnitId: u7Each, code: '899700700001', symbology: 'EAN13', isPrimary: true }
  ];

  // Lots
  const lot1 = '70000000-0000-0000-0000-000000000001';
  const lots: Lot[] = [
    {
      id: lot1,
      tenantId,
      itemId: item2,
      lotNumber: 'LT-2026-0312',
      expiryDate: '2026-05-12',
      manufacturedDate: '2026-03-01',
      createdAt: '2026-03-01T00:00:00Z'
    }
  ];

  const serialUnits: SerialUnit[] = [
    { id: '71000000-0000-0000-0000-000000000001', tenantId, itemId: item6, serialNumber: 'SN-BT5-00192', status: 'Available', currentLocationId: locBinA0101, createdAt: '2026-01-01T00:00:00Z' }
  ];

  const handlingUnits: HandlingUnit[] = [
    { id: '72000000-0000-0000-0000-000000000001', tenantId, lpnCode: 'LPN-202604-001', itemUnitId: u2Pallet, currentLocationId: locBinC020301, status: 'InStorage', quantity: 40, createdAt: '2026-04-01T00:00:00Z' }
  ];

  // Movements (Event Ledger)
  const movements: Movement[] = [
    {
      id: '80000000-0000-0000-0000-000000000001',
      tenantId,
      itemId: item1,
      toLocationId: locBinA0101,
      quantityBase: 450,
      inventoryStatus: 'Available',
      reason: 'Putaway',
      referenceDoc: 'RCP-0080',
      userId: users[0].id,
      createdAt: '2026-04-20T10:00:00Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000002',
      tenantId,
      itemId: item1,
      toLocationId: locBinA010302,
      quantityBase: 1914,
      inventoryStatus: 'Available',
      reason: 'Putaway',
      referenceDoc: 'RCP-0081',
      userId: users[0].id,
      createdAt: '2026-04-21T11:00:00Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000003',
      tenantId,
      itemId: item2,
      lotId: lot1,
      toLocationId: locBinC020301,
      quantityBase: 200,
      inventoryStatus: 'Quarantined',
      reason: 'Receipt',
      referenceDoc: 'RCP-0088',
      userId: users[0].id,
      createdAt: '2026-04-28T13:42:30Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000004',
      tenantId,
      itemId: item3,
      toLocationId: locBinA030101,
      quantityBase: 18,
      inventoryStatus: 'Available',
      reason: 'Receipt',
      referenceDoc: 'RCP-0070',
      userId: users[0].id,
      createdAt: '2026-04-22T08:00:00Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000005',
      tenantId,
      itemId: item3,
      fromLocationId: locBinA030101,
      quantityBase: 6,
      inventoryStatus: 'Available',
      reason: 'Pick',
      referenceDoc: 'SO-20260428-001',
      userId: users[2].id,
      createdAt: '2026-04-28T13:55:12Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000006',
      tenantId,
      itemId: item4,
      toLocationId: locBinB020101,
      quantityBase: 1720,
      inventoryStatus: 'Available',
      reason: 'Receipt',
      referenceDoc: 'RCP-0075',
      userId: users[0].id,
      createdAt: '2026-04-25T09:00:00Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000007',
      tenantId,
      itemId: item4,
      toLocationId: locBinB020101,
      quantityBase: 120,
      inventoryStatus: 'Available',
      reason: 'Putaway',
      referenceDoc: 'RCP-0089',
      userId: users[1].id,
      createdAt: '2026-04-28T14:30:05Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000008',
      tenantId,
      itemId: item5,
      fromLocationId: locBinC010204,
      toLocationId: locBinC020301,
      quantityBase: 15,
      inventoryStatus: 'Available',
      reason: 'Relocation',
      referenceDoc: 'Rebalance',
      userId: users[1].id,
      createdAt: '2026-04-28T14:28:44Z'
    },
    {
      id: '80000000-0000-0000-0000-000000000009',
      tenantId,
      itemId: item1,
      fromLocationId: locBinA010302,
      quantityBase: 24,
      inventoryStatus: 'Available',
      reason: 'Pick',
      referenceDoc: 'SO-20260428-001',
      userId: users[1].id,
      createdAt: '2026-04-28T14:32:18Z'
    }
  ];

  // Tasks
  const tasks: Task[] = [
    {
      id: '90000000-0000-0000-0000-000000000001',
      tenantId,
      type: 'Pick',
      status: 'InProgress',
      priority: 1,
      title: 'SO-20260428-001 Â· 14 lines',
      referenceDoc: 'SO-20260428-001',
      assignedDeviceId: devices[2].id,
      assignedDeviceCode: devices[2].deviceCode,
      locationHint: 'Zone A',
      downloadedAt: '2026-04-28T14:00:00Z',
      createdAt: '2026-04-28T13:30:00Z',
      lines: [
        {
          id: '91000000-0000-0000-0000-000000000001',
          tenantId,
          taskId: '90000000-0000-0000-0000-000000000001',
          itemId: item1,
          itemName: 'Steel Bolt M8Ã40',
          itemSku: 'SKU-0001',
          itemUnitId: u1Each,
          unitName: 'Each',
          sourceLocationId: locBinA010302,
          sourceLocationName: 'A-01-03-02',
          expectedQty: 24,
          completedQty: 24,
          status: 'Completed'
        },
        {
          id: '91000000-0000-0000-0000-000000000002',
          tenantId,
          taskId: '90000000-0000-0000-0000-000000000001',
          itemId: item3,
          itemName: 'Packing Tape 48mm Clear',
          itemSku: 'SKU-0042',
          itemUnitId: u3Each,
          unitName: 'Each',
          sourceLocationId: locBinA030101,
          sourceLocationName: 'A-03-01-01',
          expectedQty: 6,
          completedQty: 6,
          status: 'Completed'
        }
      ]
    },
    {
      id: '90000000-0000-0000-0000-000000000002',
      tenantId,
      type: 'Putaway',
      status: 'Pending',
      priority: 2,
      title: 'Receipt RCP-0089 Â· 6 items',
      referenceDoc: 'RCP-0089',
      assignedDeviceId: devices[0].id,
      assignedDeviceCode: devices[0].deviceCode,
      locationHint: 'Receiving Dock',
      createdAt: '2026-04-28T14:15:00Z',
      lines: [
        {
          id: '91000000-0000-0000-0000-000000000003',
          tenantId,
          taskId: '90000000-0000-0000-0000-000000000002',
          itemId: item4,
          itemName: 'Corrugated Box 40Ã30Ã20',
          itemSku: 'SKU-0058',
          itemUnitId: u4Each,
          unitName: 'Each',
          sourceLocationId: locDock,
          sourceLocationName: 'Receiving Dock',
          destLocationId: locBinB020101,
          destLocationName: 'B-02-01-01',
          expectedQty: 120,
          completedQty: 0,
          status: 'Pending'
        }
      ]
    },
    {
      id: '90000000-0000-0000-0000-000000000003',
      tenantId,
      type: 'Count',
      status: 'Pending',
      priority: 3,
      title: 'Cycle Count Â· Zone B, Aisle 4',
      referenceDoc: 'CNT-20260428-B',
      assignedUserId: users[1].id,
      assignedUserName: users[1].name,
      locationHint: 'Zone B, Aisle 4',
      createdAt: '2026-04-28T09:00:00Z',
      lines: [
        {
          id: '91000000-0000-0000-0000-000000000004',
          tenantId,
          taskId: '90000000-0000-0000-0000-000000000003',
          itemId: item4,
          itemName: 'Corrugated Box 40Ã30Ã20',
          itemSku: 'SKU-0058',
          itemUnitId: u4Each,
          unitName: 'Each',
          sourceLocationId: locBinB020101,
          sourceLocationName: 'B-02-01-01',
          expectedQty: 1840,
          completedQty: 0,
          status: 'Pending'
        }
      ]
    },
    {
      id: '90000000-0000-0000-0000-000000000004',
      tenantId,
      type: 'ReceiptCheck',
      status: 'Pending',
      priority: 1,
      title: 'PO-4521 Â· Vendor: FastPack Supply',
      referenceDoc: 'PO-4521',
      locationHint: 'Receiving Dock',
      createdAt: '2026-04-28T11:30:00Z',
      lines: [
        {
          id: '91000000-0000-0000-0000-000000000005',
          tenantId,
          taskId: '90000000-0000-0000-0000-000000000004',
          itemId: item7,
          itemName: 'Stretch Wrap 500mm',
          itemSku: 'SKU-0301',
          itemUnitId: u7Case,
          unitName: 'Case (4)',
          destLocationId: locDock,
          destLocationName: 'Receiving Dock',
          expectedQty: 48,
          completedQty: 0,
          status: 'Pending'
        }
      ]
    }
  ];

  const taskEvents: TaskEvent[] = [
    {
      id: '92000000-0000-0000-0000-000000000001',
      tenantId,
      clientEventId: '93000000-0000-0000-0000-000000000001',
      taskId: tasks[0].id,
      taskLineId: tasks[0].lines[0].id,
      type: 'ConfirmQuantity',
      scannedBarcode: '899100100001',
      qtyScanned: 24,
      itemUnitId: u1Each,
      deviceOccurredAt: '2026-04-28T14:32:15Z',
      serverReceivedAt: '2026-04-28T14:32:18Z'
    }
  ];

  return {
    tenants,
    users,
    devices,
    locations,
    items,
    itemUnits,
    barcodes,
    lots,
    serialUnits,
    handlingUnits,
    movements,
    tasks,
    taskEvents
  };
}
