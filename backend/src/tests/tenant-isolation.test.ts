import request from 'supertest';
import { app } from '../app';
import { db } from '../infrastructure/db';

describe('Tenant Isolation Integration Tests', () => {
  beforeEach(() => {
    db.resetAndSeed();
  });

  const tenant1 = '00000000-0000-0000-0000-000000000001';
  const tenant2 = '00000000-0000-0000-0000-000000000002';

  it('should isolate items catalog strictly per tenant', async () => {
    // Tenant 1 request
    const res1 = await request(app)
      .get('/api/items')
      .set('x-tenant-id', tenant1);
    expect(res1.status).toBe(200);
    expect(res1.body.items.length).toBeGreaterThan(0);
    expect(res1.body.items.every((i: any) => i.tenantId === tenant1)).toBe(true);

    // Tenant 2 request (starts with 0 items)
    const res2 = await request(app)
      .get('/api/items')
      .set('x-tenant-id', tenant2);
    expect(res2.status).toBe(200);
    expect(res2.body.items.length).toBe(0);
  });

  it('should not allow Tenant 2 to access Tenant 1 item by ID', async () => {
    const tenant1Item = db.items[0];
    const res = await request(app)
      .get(`/api/items/${tenant1Item.id}`)
      .set('x-tenant-id', tenant2);
    expect(res.status).toBe(404);
  });

  it('should isolate stock balances between tenants', async () => {
    const res1 = await request(app)
      .get('/api/stock/balances')
      .set('x-tenant-id', tenant1);
    expect(res1.status).toBe(200);
    expect(res1.body.length).toBeGreaterThan(0);

    const res2 = await request(app)
      .get('/api/stock/balances')
      .set('x-tenant-id', tenant2);
    expect(res2.status).toBe(200);
    expect(res2.body.length).toBe(0);
  });
});
