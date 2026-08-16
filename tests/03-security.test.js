/**
 * PART 3: Security & Isolation Tests
 * Specifically tests Multi-tenancy isolation and deep RBAC.
 */
const request = require('supertest');
const { app, setupDatabase, teardownDatabase } = require('./setup');

const ctx = {
  superAdminToken: null,
  store1: { id: null, adminToken: null, productId: null },
  store2: { id: null, adminToken: null, productId: null },
};

beforeAll(async () => {
  await setupDatabase();

  // 1. Login Super Admin
  let res = await request(app).post('/api/auth/login')
    .send({ email: 'superadmin@stockms.com', password: 'SuperAdmin@123' });
  ctx.superAdminToken = res.body.data.token;

  // 2. Create Store 1 + Admin 1
  res = await request(app).post('/api/stores')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Store 1', owner_name: 'Owner 1' });
  ctx.store1.id = res.body.data.id;

  await request(app).post('/api/users')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Admin 1', email: 'admin1@test.com', password: 'password123', role: 'ADMIN', store_id: ctx.store1.id });

  res = await request(app).post('/api/auth/login')
    .send({ email: 'admin1@test.com', password: 'password123' });
  ctx.store1.adminToken = res.body.data.token;

  // 3. Create Store 2 + Admin 2
  res = await request(app).post('/api/stores')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Store 2', owner_name: 'Owner 2' });
  ctx.store2.id = res.body.data.id;

  await request(app).post('/api/users')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Admin 2', email: 'admin2@test.com', password: 'password123', role: 'ADMIN', store_id: ctx.store2.id });

  res = await request(app).post('/api/auth/login')
    .send({ email: 'admin2@test.com', password: 'password123' });
  ctx.store2.adminToken = res.body.data.token;

  // 4. Create Product in Store 1
  res = await request(app).post('/api/products')
    .set('Authorization', `Bearer ${ctx.store1.adminToken}`)
    .send({ name: 'S1 Product', purchase_price: 100, selling_price: 200 });
  ctx.store1.productId = res.body.data.id;

  // 5. Create Product in Store 2
  res = await request(app).post('/api/products')
    .set('Authorization', `Bearer ${ctx.store2.adminToken}`)
    .send({ name: 'S2 Product', purchase_price: 500, selling_price: 1000 });
  ctx.store2.productId = res.body.data.id;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Multi-tenant Isolation', () => {
  it('Admin 1 should NOT be able to see Store 2 products in list', async () => {
    const res = await request(app).get('/api/products')
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`);
    
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('S1 Product');
    expect(items.find(p => p.id === ctx.store2.productId)).toBeUndefined();
  });

  it('Admin 1 should NOT be able to get Store 2 product by ID', async () => {
    const res = await request(app).get(`/api/products/${ctx.store2.productId}`)
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`);
    
    expect(res.status).toBe(404); // Or 403, but 404 is standard for "not found in your scope"
  });

  it('Admin 1 should NOT be able to update Store 2 product', async () => {
    const res = await request(app).put(`/api/products/${ctx.store2.productId}`)
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`)
      .send({ selling_price: 9999 });
    
    expect(res.status).toBe(404);
  });

  it('Admin 1 should NOT be able to delete Store 2 product', async () => {
    const res = await request(app).delete(`/api/products/${ctx.store2.productId}`)
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`);
    
    expect(res.status).toBe(404);
  });

  it('Admin 1 should NOT be able to add stock to Store 2 product', async () => {
    const res = await request(app).post('/api/stock/in')
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`)
      .send({ product_id: ctx.store2.productId, quantity: 10 });
    
    expect(res.status).toBe(404);
  });

  it('Admin 1 should NOT be able to create bill for Store 2 product', async () => {
    const res = await request(app).post('/api/billing')
      .set('Authorization', `Bearer ${ctx.store1.adminToken}`)
      .send({
        items: [{ product_id: ctx.store2.productId, quantity: 1 }]
      });
    
    expect(res.status).toBe(404);
  });

  it('Super Admin SHOULD be able to see products from any store using storeId query param', async () => {
    const res = await request(app).get(`/api/products?store_id=${ctx.store1.id}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBe(1);
    expect(items[0].name).toBe('S1 Product');
  });

  it('Super Admin should FAIL if no store context is provided', async () => {
    const res = await request(app).get('/api/products')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Store context is required');
  });
});

describe('RBAC Deep Dive', () => {
  it('Staff member should NOT be able to create products (if restricted)', async () => {
    // Create staff member in Store 1
    await request(app).post('/api/users')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({ name: 'Staff 1', email: 'staff1@test.com', password: 'password123', role: 'STAFF', store_id: ctx.store1.id });

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: 'staff1@test.com', password: 'password123' });
    const staffToken = loginRes.body.data.token;

    const res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ name: 'Staff Product', purchase_price: 1, selling_price: 2 });
    
    // Our Product routes are: router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
    expect(res.status).toBe(403);
  });

  it('Staff member should be able to check in and check out themselves', async () => {
    await request(app).post('/api/users')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({ name: 'Self Staff', email: 'selfstaff@test.com', password: 'password123', role: 'STAFF', store_id: ctx.store1.id });

    const loginRes = await request(app).post('/api/auth/login')
      .send({ email: 'selfstaff@test.com', password: 'password123' });
    const staffToken = loginRes.body.data.token;

    const meRes = await request(app).get('/api/staff/me')
      .set('Authorization', `Bearer ${staffToken}`);
    expect(meRes.status).toBe(200);
    const staffId = meRes.body.data.id;

    const checkInRes = await request(app).post(`/api/staff/${staffId}/check-in`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(checkInRes.status).toBe(201);
    expect(checkInRes.body.data.check_in).toBeDefined();

    const checkOutRes = await request(app).post(`/api/staff/${staffId}/check-out`)
      .set('Authorization', `Bearer ${staffToken}`);
    expect(checkOutRes.status).toBe(200);
    expect(checkOutRes.body.data.check_out).toBeDefined();
    expect(['PRESENT', 'HALF_DAY']).toContain(checkOutRes.body.data.status);
  });
});
