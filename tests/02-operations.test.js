/**
 * PART 2: Stock, Customers, Billing, Reports Tests
 */
const request = require('supertest');
const { app, setupDatabase, teardownDatabase } = require('./setup');

const ctx = {
  superAdminToken: null,
  adminToken: null,
  storeId: null,
  productId: null,
  product2Id: null,
  customerId: null,
  billId: null,
  staffId: null,
};

// Bootstrap: create store, admin, products, login
beforeAll(async () => {
  await setupDatabase();

  // Login Super Admin
  let res = await request(app).post('/api/auth/login')
    .send({ email: 'superadmin@stockms.com', password: 'SuperAdmin@123' });
  ctx.superAdminToken = res.body.data.token;

  // Create store
  res = await request(app).post('/api/stores')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Test Store', owner_name: 'Owner', email: 'o@s.com', phone: '1234567890' });
  ctx.storeId = res.body.data.id;

  // Create admin
  res = await request(app).post('/api/users')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Admin', email: 'admin2@test.com', password: 'pass1234', role: 'ADMIN', store_id: ctx.storeId });

  // Login admin
  res = await request(app).post('/api/auth/login')
    .send({ email: 'admin2@test.com', password: 'pass1234' });
  ctx.adminToken = res.body.data.token;

  // Create products
  res = await request(app).post('/api/products')
    .set('Authorization', `Bearer ${ctx.adminToken}`)
    .send({ name: 'Widget A', purchase_price: 100, selling_price: 200, gst_percent: 18, stock_quantity: 50, min_stock_level: 5 });
  ctx.productId = res.body.data.id;

  res = await request(app).post('/api/products')
    .set('Authorization', `Bearer ${ctx.adminToken}`)
    .send({ name: 'Widget B', purchase_price: 50, selling_price: 100, gst_percent: 12, stock_quantity: 3, min_stock_level: 10 });
  ctx.product2Id = res.body.data.id;
}, 30000);

afterAll(async () => {
  await teardownDatabase();
});

// ─────────────────────────────────────────
// 6. STOCK
// ─────────────────────────────────────────
describe('Stock API', () => {
  it('POST /api/stock/in → should add stock', async () => {
    const res = await request(app).post('/api/stock/in')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ product_id: ctx.productId, quantity: 25, purchase_price: 95, supplier_name: 'Supplier Co', reason: 'Restock' });
    expect(res.status).toBe(201);
    expect(res.body.data.new_stock_quantity).toBe(75);
    expect(res.body.data.history.type).toBe('IN');
  });

  it('POST /api/stock/out → should remove stock', async () => {
    const res = await request(app).post('/api/stock/out')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ product_id: ctx.productId, quantity: 5, reason: 'Damaged' });
    expect(res.status).toBe(200);
    expect(res.body.data.new_stock_quantity).toBe(70);
  });

  it('POST /api/stock/out → should reject insufficient stock', async () => {
    const res = await request(app).post('/api/stock/out')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ product_id: ctx.product2Id, quantity: 999, reason: 'Test' });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient');
  });

  it('POST /api/stock/in → should reject invalid data', async () => {
    const res = await request(app).post('/api/stock/in')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ quantity: 10 }); // missing product_id
    expect(res.status).toBe(400);
  });

  it('GET /api/stock/history → should return stock history', async () => {
    const res = await request(app).get('/api/stock/history')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('GET /api/stock/history?type=IN → should filter by type', async () => {
    const res = await request(app).get('/api/stock/history?type=IN')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    items.forEach((h) => expect(h.type).toBe('IN'));
  });

  it('GET /api/stock/low-stock → should detect low stock', async () => {
    const res = await request(app).get('/api/stock/low-stock')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    // Widget B has stock=3, min=10 → should appear
    const found = res.body.data.find((p) => p.id === ctx.product2Id);
    expect(found).toBeDefined();
  });
});

// ─────────────────────────────────────────
// 7. CUSTOMERS
// ─────────────────────────────────────────
describe('Customer API', () => {
  it('POST /api/customers → should create customer', async () => {
    const res = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'John Doe', phone: '9876543210', address: '456 Park Street' });
    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('John Doe');
    ctx.customerId = res.body.data.id;
  });

  it('POST /api/customers → should reject missing name', async () => {
    const res = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ phone: '111' });
    expect(res.status).toBe(400);
  });

  it('GET /api/customers → should list customers', async () => {
    const res = await request(app).get('/api/customers')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBe(1);
    expect(items[0].coins).toBeDefined();
  });

  it('GET /api/customers/:id → should get customer by ID', async () => {
    const res = await request(app).get(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('John Doe');
  });
});

// ─────────────────────────────────────────
// 8. BILLING
// ─────────────────────────────────────────
describe('Billing API', () => {
  it('POST /api/billing → should create a bill with GST', async () => {
    const res = await request(app).post('/api/billing')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({
        customer_id: ctx.customerId,
        items: [
          { product_id: ctx.productId, quantity: 2 },
          { product_id: ctx.product2Id, quantity: 1 },
        ],
        discount: 50,
        payment_method: 'UPI',
        paid_status: 'PAID',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.invoice_number).toContain('INV-');
    expect(parseFloat(res.body.data.gst_amount)).toBeGreaterThan(0);
    expect(parseFloat(res.body.data.final_amount)).toBeGreaterThan(0);
    expect(res.body.data.items.length).toBe(2);
    ctx.billId = res.body.data.id;
  });

  it('POST /api/billing → should award coins for purchase and deduct used coins', async () => {
    const before = await request(app).get(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(before.status).toBe(200);
    const beforeCoins = parseInt(before.body.data.coins, 10) || 0;

    const res = await request(app).post('/api/billing')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({
        customer_id: ctx.customerId,
        items: [
          { product_id: ctx.product2Id, quantity: 2 },
        ],
        coins: 1,
        payment_method: 'CASH',
        paid_status: 'PAID',
      });

    expect(res.status).toBe(201);
    expect(typeof res.body.data.coins_used).toBe('number');
    const earnedCoins = Math.floor(parseFloat(res.body.data.final_amount) / 100);

    const after = await request(app).get(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(after.status).toBe(200);
    expect(parseInt(after.body.data.coins, 10)).toBe(beforeCoins - 1 + earnedCoins);
  });

  it('POST /api/billing → should reduce stock after billing', async () => {
    const res = await request(app).get(`/api/products/${ctx.productId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    // Was 70 (after stock in/out), sold 2 → should be 68
    expect(res.body.data.stock_quantity).toBe(68);
  });

  it('POST /api/billing → should reject insufficient stock', async () => {
    const res = await request(app).post('/api/billing')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({
        items: [{ product_id: ctx.product2Id, quantity: 9999 }],
        payment_method: 'CASH',
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('Insufficient');
  });

  it('POST /api/billing → should reject empty items', async () => {
    const res = await request(app).post('/api/billing')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ items: [], payment_method: 'CASH' });
    expect(res.status).toBe(400);
  });

  it('GET /api/billing → should list bills', async () => {
    const res = await request(app).get('/api/billing')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/billing/:id → should get bill with items', async () => {
    const res = await request(app).get(`/api/billing/${ctx.billId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.items.length).toBe(2);
    expect(res.body.data.customer).toBeDefined();
  });

  it('GET /api/customers/:id/purchases → should show purchase history', async () => {
    const res = await request(app).get(`/api/customers/${ctx.customerId}/purchases`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    const items = Array.isArray(res.body.data) ? res.body.data : res.body.data.items;
    expect(items.length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────
// 9. REPORTS
// ─────────────────────────────────────────
describe('Report API', () => {
  it('GET /api/reports/dashboard → should return stats', async () => {
    const res = await request(app).get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.total_products).toBe(2);
    expect(res.body.data.total_customers).toBe(1);
    expect(res.body.data.today_sales).toBeGreaterThan(0);
    expect(res.body.data.low_stock_count).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/reports/sales → should return sales report', async () => {
    const res = await request(app).get('/api/reports/sales')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/reports/profit → should return profit breakdown', async () => {
    const res = await request(app).get('/api/reports/profit')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.summary.total_profit).toBeGreaterThan(0);
    expect(res.body.data.by_product.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /api/reports/gst → should return GST report', async () => {
    const res = await request(app).get('/api/reports/gst')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });
});

// ─────────────────────────────────────────
// 10. STAFF & ATTENDANCE
// ─────────────────────────────────────────
describe('Staff API', () => {
  it('POST /api/staff → should create staff member', async () => {
    const res = await request(app).post('/api/staff')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Rohit Sharma', phone: '9988776655', salary: 25000, joining_date: '2026-04-01' });
    expect(res.status).toBe(201);
    ctx.staffId = res.body.data.id;
  });

  it('GET /api/staff → should list staff', async () => {
    const res = await request(app).get('/api/staff')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });

  it('GET /api/staff/:id → should get staff by ID', async () => {
    const res = await request(app).get(`/api/staff/${ctx.staffId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Rohit Sharma');
  });

  it('POST /api/staff/:id/check-in → should check in', async () => {
    const res = await request(app).post(`/api/staff/${ctx.staffId}/check-in`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(201);
    expect(res.body.data.check_in).toBeDefined();
    expect(res.body.data.check_out).toBeNull();
  });

  it('POST /api/staff/:id/check-in → should reject double check-in', async () => {
    const res = await request(app).post(`/api/staff/${ctx.staffId}/check-in`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(400);
  });

  it('POST /api/staff/:id/check-out → should check out with hours and half-day when <6h', async () => {
    const res = await request(app).post(`/api/staff/${ctx.staffId}/check-out`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.check_out).toBeDefined();
    expect(res.body.data.working_hours).toBeDefined();
    expect(res.body.data.status).toBe('HALF_DAY');
  });

  it('POST /api/staff/:id/check-out → should reject without check-in', async () => {
    const res = await request(app).post(`/api/staff/${ctx.staffId}/check-out`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(400);
  });

  it('GET /api/staff/:id/attendance → should return records', async () => {
    const res = await request(app).get(`/api/staff/${ctx.staffId}/attendance`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ─────────────────────────────────────────
// 11. SALARY
// ─────────────────────────────────────────
describe('Salary API', () => {
  it('POST /api/salary → should record salary payment', async () => {
    const res = await request(app).post('/api/salary')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ staff_id: ctx.staffId, month: '2026-04', amount: 25000, payment_method: 'BANK_TRANSFER', status: 'PAID' });
    expect(res.status).toBe(201);
    expect(res.body.data.month).toBe('2026-04');
  });

  it('POST /api/salary → should reject invalid month', async () => {
    const res = await request(app).post('/api/salary')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ staff_id: ctx.staffId, month: 'April', amount: 25000 });
    expect(res.status).toBe(400);
  });

  it('GET /api/salary/staff/:staffId → should return history', async () => {
    const res = await request(app).get(`/api/salary/staff/${ctx.staffId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(1);
  });
});

// ─────────────────────────────────────────
// 12. PRODUCT DELETE (last, to not break billing tests)
// ─────────────────────────────────────────
describe('Product Deletion', () => {
  it('DELETE /api/products/:id → should delete product', async () => {
    // Create a disposable product to delete
    let res = await request(app).post('/api/products')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'To Delete', purchase_price: 10, selling_price: 20, stock_quantity: 1 });
    const delId = res.body.data.id;

    res = await request(app).delete(`/api/products/${delId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);

    // Verify it's gone
    res = await request(app).get(`/api/products/${delId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(404);
  });
});

// ─────────────────────────────────────────
// 13. 404 HANDLER
// ─────────────────────────────────────────
describe('404 Handler', () => {
  it('GET /api/nonexistent → should return 404', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
