import request from 'supertest';
import { app } from '../app';
import { db } from '../infrastructure/db';

describe('Sync Idempotency and Movement Ledger Replay Tests', () => {
  beforeEach(() => {
    db.resetAndSeed();
  });

  const tenantId = '00000000-0000-0000-0000-000000000001';

  it('should process new offline TaskEvents and produce Movement records', async () => {
    const initialMovements = db.movements.length;
    const eventId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const task = db.tasks[1]; // Putaway task
    const taskLine = task.lines[0];

    const payload = {
      deviceId: '20000000-0000-0000-0000-000000000001',
      events: [
        {
          clientEventId: eventId,
          taskId: task.id,
          taskLineId: taskLine.id,
          type: 'ConfirmQuantity',
          qtyScanned: 50,
          deviceOccurredAt: new Date().toISOString()
        }
      ]
    };

    const res = await request(app)
      .post('/api/sync/events')
      .set('x-tenant-id', tenantId)
      .send(payload);

    expect(res.status).toBe(200);
    expect(res.body.processedCount).toBe(1);
    expect(res.body.results[0].status).toBe('Applied');
    expect(db.movements.length).toBe(initialMovements + 1);
  });

  it('should skip duplicate clientEventId without duplicating movements (Idempotency)', async () => {
    const eventId = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';
    const task = db.tasks[1];
    const taskLine = task.lines[0];

    const payload = {
      deviceId: '20000000-0000-0000-0000-000000000001',
      events: [
        {
          clientEventId: eventId,
          taskId: task.id,
          taskLineId: taskLine.id,
          type: 'ConfirmQuantity',
          qtyScanned: 30,
          deviceOccurredAt: new Date().toISOString()
        }
      ]
    };

    // 1st upload
    const res1 = await request(app)
      .post('/api/sync/events')
      .set('x-tenant-id', tenantId)
      .send(payload);
    expect(res1.body.results[0].status).toBe('Applied');
    const countAfterFirst = db.movements.length;

    // 2nd upload (retry after dropped connection)
    const res2 = await request(app)
      .post('/api/sync/events')
      .set('x-tenant-id', tenantId)
      .send(payload);
    expect(res2.body.results[0].status).toBe('AlreadyProcessed');
    expect(db.movements.length).toBe(countAfterFirst);
  });

  it('should correctly derive on-hand stock by replaying movements', () => {
    const balances = db.computeStockBalances(tenantId);
    expect(balances.length).toBeGreaterThan(0);
    
    // Verify Steel Bolt M8x40 has positive balance
    const boltBalance = balances.find(b => b.itemSku === 'SKU-0001');
    expect(boltBalance).toBeDefined();
    expect(boltBalance!.quantity).toBeGreaterThan(0);
  });
});
