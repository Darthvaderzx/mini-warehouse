import { 
  Tenant, UserAccount, Device, Item, ItemUnit, Barcode, 
  Location, Lot, SerialUnit, HandlingUnit, Task, TaskLine, 
  TaskEvent, Movement, InventoryStatus 
} from '../domain/entities';
import { initialSeedData } from './seed';

export interface StockBalanceResult {
  itemId: string;
  itemSku: string;
  itemName: string;
  locationId: string;
  locationName: string;
  lotId?: string;
  lotNumber?: string;
  expiryDate?: string;
  quantity: number;
  unitName: string;
  status: InventoryStatus;
}

export class DatabaseStore {
  tenants: Tenant[] = [];
  users: UserAccount[] = [];
  devices: Device[] = [];
  items: Item[] = [];
  itemUnits: ItemUnit[] = [];
  barcodes: Barcode[] = [];
  locations: Location[] = [];
  lots: Lot[] = [];
  serialUnits: SerialUnit[] = [];
  handlingUnits: HandlingUnit[] = [];
  tasks: Task[] = [];
  taskEvents: TaskEvent[] = [];
  movements: Movement[] = [];

  constructor() {
    this.resetAndSeed();
  }

  resetAndSeed() {
    const seed = initialSeedData();
    this.tenants = seed.tenants;
    this.users = seed.users;
    this.devices = seed.devices;
    this.items = seed.items;
    this.itemUnits = seed.itemUnits;
    this.barcodes = seed.barcodes;
    this.locations = seed.locations;
    this.lots = seed.lots;
    this.serialUnits = seed.serialUnits;
    this.handlingUnits = seed.handlingUnits;
    this.tasks = seed.tasks;
    this.taskEvents = seed.taskEvents;
    this.movements = seed.movements;
  }

  // Strict Tenant Scoping Filter
  scoped<T extends { tenantId: string }>(items: T[], tenantId: string): T[] {
    return items.filter(item => item.tenantId === tenantId);
  }

  // Compute derived on-hand stock balances dynamically by replaying Movements
  computeStockBalances(tenantId: string, filter?: { itemId?: string; locationId?: string; status?: string }): StockBalanceResult[] {
    const movements = this.scoped(this.movements, tenantId);
    const itemsMap = new Map(this.scoped(this.items, tenantId).map(i => [i.id, i]));
    const unitsMap = new Map(this.scoped(this.itemUnits, tenantId).map(u => [u.id, u]));
    const locsMap = new Map(this.scoped(this.locations, tenantId).map(l => [l.id, l]));
    const lotsMap = new Map(this.scoped(this.lots, tenantId).map(l => [l.id, l]));

    // Key: itemId|locationId|lotId|status
    const balances = new Map<string, {
      itemId: string;
      locationId: string;
      lotId?: string;
      status: InventoryStatus;
      quantity: number;
    }>();

    for (const mov of movements) {
      const lotId = mov.lotId || '';
      const status = mov.inventoryStatus;

      // Inbound to destination location
      if (mov.toLocationId) {
        const key = `${mov.itemId}|${mov.toLocationId}|${lotId}|${status}`;
        const current = balances.get(key) || {
          itemId: mov.itemId,
          locationId: mov.toLocationId,
          lotId: mov.lotId,
          status,
          quantity: 0
        };
        current.quantity += Number(mov.quantityBase);
        balances.set(key, current);
      }

      // Outbound from source location
      if (mov.fromLocationId) {
        const key = `${mov.itemId}|${mov.fromLocationId}|${lotId}|${status}`;
        const current = balances.get(key) || {
          itemId: mov.itemId,
          locationId: mov.fromLocationId,
          lotId: mov.lotId,
          status,
          quantity: 0
        };
        current.quantity -= Number(mov.quantityBase);
        balances.set(key, current);
      }
    }

    const results: StockBalanceResult[] = [];
    for (const entry of balances.values()) {
      if (entry.quantity <= 0.0001) continue;

      if (filter?.itemId && entry.itemId !== filter.itemId) continue;
      if (filter?.locationId && entry.locationId !== filter.locationId) continue;
      if (filter?.status && entry.status.toLowerCase() !== filter.status.toLowerCase()) continue;

      const item = itemsMap.get(entry.itemId);
      const loc = locsMap.get(entry.locationId);
      const lot = entry.lotId ? lotsMap.get(entry.lotId) : undefined;
      const baseUnit = this.scoped(this.itemUnits, tenantId).find(u => u.itemId === entry.itemId && u.isBaseUnit);

      results.push({
        itemId: entry.itemId,
        itemSku: item?.sku || 'UNKNOWN',
        itemName: item?.name || 'Unknown Item',
        locationId: entry.locationId,
        locationName: loc?.name || 'Unknown Location',
        lotId: entry.lotId,
        lotNumber: lot?.lotNumber,
        expiryDate: lot?.expiryDate,
        quantity: Math.round(entry.quantity * 100) / 100,
        unitName: baseUnit?.levelName || 'ea',
        status: entry.status
      });
    }

    return results;
  }
}

export const db = new DatabaseStore();
