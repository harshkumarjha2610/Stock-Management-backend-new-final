/**
 * FULL API INTEGRATION TEST SUITE
 * Tests every endpoint in a realistic workflow order.
 * Run: npm test
 */
const request = require('supertest');
const { app, setupDatabase, teardownDatabase } = require('./setup');

// Shared state across all tests (populated as we go)
const ctx = {
  superAdminToken: null,
  adminToken: null,
  storeId: null,
  adminUserId: null,
  productId: null,
  product2Id: null,
  customerId: null,
  staffId: null,
  billId: null,
};

beforeAll(async () => {
  await setupDatabase();
});

afterAll(async () => {
  await teardownDatabase();
});

// ─────────────────────────────────────────
// 1. HEALTH CHECK
// ─────────────────────────────────────────
describe('Health Check', () => {
  it('GET /api/health → should return server status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('running');
  });
});

// ─────────────────────────────────────────
// 2. AUTH
// ─────────────────────────────────────────
describe('Auth API', () => {
  it('POST /api/auth/login → should reject invalid credentials', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrong123' });
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/login → should reject missing fields', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'test@test.com' });
    expect(res.status).toBe(400);
  });

  it('POST /api/auth/login → should login Super Admin', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'superadmin@stockms.com', password: 'SuperAdmin@123' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.user.role).toBe('SUPER_ADMIN');
    ctx.superAdminToken = res.body.data.token;
  });
});

// ─────────────────────────────────────────
// 3. STORES
// ─────────────────────────────────────────
describe('Store API', () => {
  it('POST /api/stores → should reject without auth', async () => {
    const res = await request(app).post('/api/stores')
      .send({ name: 'Test', owner_name: 'Owner' });
    expect(res.status).toBe(401);
  });

  it('POST /api/stores → should create a store', async () => {
    const res = await request(app).post('/api/stores')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({
        name: 'Mumbai Electronics',
        owner_name: 'Raj Patel',
        email: 'raj@mumbai.com',
        phone: '9876543210',
        address: '123 Marine Drive, Mumbai',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Mumbai Electronics');
    ctx.storeId = res.body.data.id;
  });

  it('POST /api/stores → should reject invalid data', async () => {
    const res = await request(app).post('/api/stores')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({ name: 'X' }); // missing owner_name, name too short
    expect(res.status).toBe(400);
  });

  it('GET /api/stores → should list all stores', async () => {
    const res = await request(app).get('/api/stores')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/stores/:id → should get store by ID', async () => {
    const res = await request(app).get(`/api/stores/${ctx.storeId}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(ctx.storeId);
  });

  it('GET /api/stores/999 → should return 404', async () => {
    const res = await request(app).get('/api/stores/999')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────
// 4. USERS
// ─────────────────────────────────────────
describe('User API', () => {
  it('POST /api/users → should create an Admin user', async () => {
    const res = await request(app).post('/api/users')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({
        name: 'Store Admin',
        email: 'admin@store1.com',
        password: 'admin123',
        role: 'ADMIN',
        store_id: ctx.storeId,
      });
    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('ADMIN');
    ctx.adminUserId = res.body.data.id;
  });

  it('POST /api/users → should reject duplicate email', async () => {
    const res = await request(app).post('/api/users')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({
        name: 'Duplicate',
        email: 'admin@store1.com',
        password: 'admin123',
        role: 'ADMIN',
        store_id: ctx.storeId,
      });
    expect(res.status).toBe(409);
  });

  it('POST /api/auth/login → should login as Admin', async () => {
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'admin@store1.com', password: 'admin123' });
    expect(res.status).toBe(200);
    ctx.adminToken = res.body.data.token;
  });

  it('GET /api/users/profile → should get own profile', async () => {
    const res = await request(app).get('/api/users/profile')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@store1.com');
  });

  it('GET /api/users/store/:storeId → should list store users', async () => {
    const res = await request(app).get(`/api/users/store/${ctx.storeId}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('Admin should NOT be able to access store routes', async () => {
    const res = await request(app).get('/api/stores')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(403);
  });
});

// ─────────────────────────────────────────
// 5. PRODUCTS
// ─────────────────────────────────────────
describe('Product API', () => {
  it('POST /api/products → should create product with auto barcode', async () => {
    const res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({
        name: 'Samsung Galaxy S24',
        category: 'Mobile Phones',
        brand: 'Samsung',
        purchase_price: 55000,
        selling_price: 69999,
        gst_percent: 18,
        stock_quantity: 50,
        min_stock_level: 5,
        description: 'Flagship phone',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.barcode).toBeDefined();
    expect(res.body.data.barcode).toContain('STR');
    ctx.productId = res.body.data.id;
  });

  it('POST /api/products → should create a second product', async () => {
    const res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({
        name: 'iPhone 16 Case',
        category: 'Accessories',
        brand: 'Apple',
        purchase_price: 200,
        selling_price: 499,
        gst_percent: 12,
        stock_quantity: 3,
        min_stock_level: 10,
      });
    expect(res.status).toBe(201);
    ctx.product2Id = res.body.data.id;
  });

  it('POST /api/products → should reject invalid data', async () => {
    const res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ category: 'test' }); // missing required name, prices
    expect(res.status).toBe(400);
  });

  it('GET /api/products → should list products with pagination', async () => {
    const res = await request(app).get('/api/products?page=1&limit=10')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.pagination.total).toBe(2);
  });

  it('GET /api/products?search=samsung → should search by name', async () => {
    const res = await request(app).get('/api/products?search=samsung')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBe(1);
  });

  it('GET /api/products/:id → should get single product', async () => {
    const res = await request(app).get(`/api/products/${ctx.productId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Samsung Galaxy S24');
  });

  it('PUT /api/products/:id → should update product', async () => {
    const res = await request(app).put(`/api/products/${ctx.productId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ selling_price: 64999 });
    expect(res.status).toBe(200);
    expect(parseFloat(res.body.data.selling_price)).toBe(64999);
  });

  it('GET /api/products/999 → should return 404', async () => {
    const res = await request(app).get('/api/products/999')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(404);
  });
});

module.exports = { ctx };
