export type UserRole = 'Owner' | 'Admin' | 'Supervisor' | 'Operator';

export type InventoryStatus = 'Available' | 'Reserved' | 'Quarantined' | 'OnHold' | 'Expired' | 'Damaged';

export type MovementReason = 
  | 'Receipt' 
  | 'Putaway' 
  | 'Pick' 
  | 'OpnameAdjustment' 
  | 'QuarantineRelease' 
  | 'Scrap' 
  | 'Relocation' 
  | 'Reservation'
  | 'ReservationRelease';

export type TaskType = 'Pick' | 'Putaway' | 'Count' | 'ReceiptCheck';
export type TaskStatus = 'Pending' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled' | 'Exception';
export type TaskLineStatus = 'Pending' | 'InProgress' | 'Completed' | 'Shorted' | 'Skipped';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: string;
}

export interface Device {
  id: string;
  tenantId: string;
  deviceCode: string;
  name: string;
  status: 'Online' | 'Offline' | 'InUse';
  lastSyncAt: string;
  assignedUserId?: string;
  assignedUserName?: string;
}

export interface Item {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  description?: string;
  category: string;
  tracksLot: boolean;
  tracksExpiry: boolean;
  tracksSerial: boolean;
  requiresQuarantineOnReceipt: boolean;
  reorderPoint: number;
  status: 'Active' | 'Inactive' | 'Discontinued';
  createdAt: string;
  units?: ItemUnit[];
  onHandQuantity?: number;
}

export interface ItemUnit {
  id: string;
  tenantId: string;
  itemId: string;
  levelName: string;
  conversionToBase: number;
  packOrder: number; // 0 = base unit
  isBaseUnit: boolean;
  tracksAsHandlingUnit: boolean;
  barcodes?: Barcode[];
}

export interface Barcode {
  id: string;
  tenantId: string;
  itemUnitId: string;
  code: string;
  symbology: 'EAN13' | 'CODE128' | 'GS1_128' | 'QR' | 'UPC';
  isPrimary: boolean;
}

export type LocationLevelType = 'Warehouse' | 'Zone' | 'Aisle' | 'Rack' | 'Bin' | 'Dock';

export interface Location {
  id: string;
  tenantId: string;
  parentLocationId?: string;
  name: string;
  levelType: LocationLevelType;
  barcode: string;
  isLeaf: boolean;
  occupancyPercent: number;
  capacityUnits: number;
  createdAt: string;
}

export interface Lot {
  id: string;
  tenantId: string;
  itemId: string;
  lotNumber: string;
  expiryDate: string;
  manufacturedDate?: string;
  createdAt: string;
}

export interface SerialUnit {
  id: string;
  tenantId: string;
  itemId: string;
  serialNumber: string;
  status: InventoryStatus;
  currentLocationId: string;
  createdAt: string;
}

export interface HandlingUnit {
  id: string;
  tenantId: string;
  lpnCode: string;
  itemUnitId: string;
  currentLocationId: string;
  status: 'InStorage' | 'InTransit' | 'Empty' | 'Damaged';
  quantity: number;
  createdAt: string;
}

export interface Task {
  id: string;
  tenantId: string;
  type: TaskType;
  status: TaskStatus;
  priority: number;
  title: string;
  referenceDoc?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  assignedDeviceId?: string;
  assignedDeviceCode?: string;
  locationHint?: string;
  downloadedAt?: string;
  completedAt?: string;
  createdAt: string;
  lines: TaskLine[];
}

export interface TaskLine {
  id: string;
  tenantId: string;
  taskId: string;
  itemId: string;
  itemName?: string;
  itemSku?: string;
  itemUnitId: string;
  unitName?: string;
  sourceLocationId?: string;
  sourceLocationName?: string;
  destLocationId?: string;
  destLocationName?: string;
  expectedQty: number;
  completedQty: number;
  lotNumber?: string;
  expiryDate?: string;
  serialNumber?: string;
  status: TaskLineStatus;
}

export interface TaskEvent {
  id: string;
  tenantId: string;
  clientEventId: string; // Idempotency key
  taskId: string;
  taskLineId?: string;
  type: 'ScanLocation' | 'ScanItem' | 'ConfirmQuantity' | 'ShortPick' | 'CountResult' | 'Exception';
  scannedBarcode?: string;
  scannedLocationBarcode?: string;
  qtyScanned?: number;
  itemUnitId?: string;
  lotNumber?: string;
  expiryDate?: string;
  serialNumber?: string;
  deviceOccurredAt: string;
  serverReceivedAt: string;
  payload?: Record<string, any>;
}

export interface Movement {
  id: string;
  tenantId: string;
  itemId: string;
  itemUnitId?: string;
  lotId?: string;
  serialNumber?: string;
  handlingUnitId?: string;
  fromLocationId?: string;
  toLocationId?: string;
  quantityBase: number;
  inventoryStatus: InventoryStatus;
  reason: MovementReason;
  referenceDoc?: string;
  taskLineId?: string;
  sourceTaskEventId?: string;
  userId: string;
  deviceId?: string;
  createdAt: string;
  // Virtual fields for display
  itemName?: string;
  itemSku?: string;
  fromLocationName?: string;
  toLocationName?: string;
  direction?: 'in' | 'out' | 'transfer';
  userName?: string;
  lotNumber?: string;
}
