import request from 'supertest';
import { app } from '../app';
import { db } from '../infrastructure/db';

describe('Barcode Non-Uniqueness and Resolution Tests', () => {
  beforeEach(() => {
    db.resetAndSeed();
  });

  const tenantId = '00000000-0000-0000-0000-000000000001';

  it('should resolve a single unique barcode scan', async () => {
    const res = await request(app)
      .post('/api/barcodes/resolve')
      .set('x-tenant-id', tenantId)
      .send({ code: '899100100001' });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].item.sku).toBe('SKU-0001');
  });

  it('should resolve ambiguous barcodes with task context prioritization', async () => {
    // Create duplicate barcode for another item unit
    const duplicateCode = '899100100001';
    const item4Unit = db.itemUnits.find(u => u.itemId === '40000000-0000-0000-0000-000000000004')!;
    db.barcodes.push({
      id: '60000000-0000-0000-0000-999999999999',
      tenantId,
      itemUnitId: item4Unit.id,
      code: duplicateCode,
      symbology: 'EAN13',
      isPrimary: false
    });

    // Resolve with task context matching task 0 (which contains SKU-0001)
    const res = await request(app)
      .post('/api/barcodes/resolve')
      .set('x-tenant-id', tenantId)
      .send({
        code: duplicateCode,
        taskId: db.tasks[0].id
      });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    const exactMatch = res.body.find((m: any) => m.confidence === 'ExactTaskMatch');
    expect(exactMatch).toBeDefined();
    expect(exactMatch.item.sku).toBe('SKU-0001');
  });
});
