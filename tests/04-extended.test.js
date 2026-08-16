/**
 * PART 4: Extended Tests (Store Update/Delete, Customer/Staff Lifecycle, Global Listings)
 */
const request = require('supertest');
const { app, setupDatabase, teardownDatabase } = require('./setup');

const ctx = {
  superAdminToken: null,
  adminToken: null,
  storeId: null,
  customerId: null,
  staffId: null,
};

beforeAll(async () => {
  await setupDatabase();

  // Login Super Admin
  let res = await request(app).post('/api/auth/login')
    .send({ email: 'superadmin@stockms.com', password: 'SuperAdmin@123' });
  ctx.superAdminToken = res.body.data.token;

  // Create store
  res = await request(app).post('/api/stores')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Alpha Store', owner_name: 'Owner A', email: 'a@store.com', phone: '1111111111' });
  ctx.storeId = res.body.data.id;

  // Login admin (bootstrap admin for the store)
  res = await request(app).post('/api/users')
    .set('Authorization', `Bearer ${ctx.superAdminToken}`)
    .send({ name: 'Admin', email: 'admin-ext@test.com', password: 'password', role: 'ADMIN', store_id: ctx.storeId });

  res = await request(app).post('/api/auth/login')
    .send({ email: 'admin-ext@test.com', password: 'password' });
  ctx.adminToken = res.body.data.token;
});

afterAll(async () => {
  await teardownDatabase();
});

describe('Extended Store API', () => {
  it('PUT /api/stores/:id → should update store details', async () => {
    const res = await request(app).put(`/api/stores/${ctx.storeId}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({ name: 'Alpha Store Pro', upi_id: 'alpha@upi' });
    if (res.status !== 200) console.error('PUT /api/stores Error:', res.body);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Alpha Store Pro');
    expect(res.body.data.upi_id).toBe('alpha@upi');
  });

  it('DELETE /api/stores/:id → should delete a store', async () => {
    // Create a temp store to delete
    let res = await request(app).post('/api/stores')
      .set('Authorization', `Bearer ${ctx.superAdminToken}`)
      .send({ name: 'Temp Store', owner_name: 'Temp Owner', email: 'temp@temp.com' });
    if (res.status !== 201) console.error('POST /api/stores Error:', res.body);
    const tempId = res.body.data.id;

    res = await request(app).delete(`/api/stores/${tempId}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(200);

    // Verify 404
    res = await request(app).get(`/api/stores/${tempId}`)
      .set('Authorization', `Bearer ${ctx.superAdminToken}`);
    expect(res.status).toBe(404);
  });
});

describe('Extended Customer API', () => {
  it('PUT /api/customers/:id → should update customer', async () => {
    // Create customer
    let res = await request(app).post('/api/customers')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Original Name', phone: '0000000000' });
    ctx.customerId = res.body.data.id;

    res = await request(app).put(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Updated Name' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('DELETE /api/customers/:id → should delete customer', async () => {
    const res = await request(app).delete(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);

    // Verify 404
    const check = await request(app).get(`/api/customers/${ctx.customerId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(check.status).toBe(404);
  });
});

describe('Extended Staff API', () => {
  it('PUT /api/staff/:id → should update staff', async () => {
    // Create staff
    let res = await request(app).post('/api/staff')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Staff A', salary: 10000 });
    ctx.staffId = res.body.data.id;

    res = await request(app).put(`/api/staff/${ctx.staffId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Staff A Updated' });
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Staff A Updated');
  });

  it('GET /api/attendance → should list all attendance records', async () => {
    // Check in first
    await request(app).post(`/api/staff/${ctx.staffId}/check-in`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);

    const res = await request(app).get('/api/attendance')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('DELETE /api/staff/:id → should delete staff', async () => {
    const res = await request(app).delete(`/api/staff/${ctx.staffId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(res.status).toBe(200);

    // Verify 404
    const check = await request(app).get(`/api/staff/${ctx.staffId}`)
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(check.status).toBe(404);
  });
});

describe('Extended Salary API', () => {
  it('GET /api/salary → should list all salary payments', async () => {
    // Create staff again (since we deleted previous)
    let res = await request(app).post('/api/staff')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ name: 'Staff B', salary: 20000 });
    const sId = res.body.data.id;

    // Record salary
    await request(app).post('/api/salary')
      .set('Authorization', `Bearer ${ctx.adminToken}`)
      .send({ staff_id: sId, month: '2026-05', amount: 20000, payment_method: 'CASH', status: 'PAID' });

    const list = await request(app).get('/api/salary')
      .set('Authorization', `Bearer ${ctx.adminToken}`);
    expect(list.status).toBe(200);
    expect(list.body.data.length).toBeGreaterThanOrEqual(1);
  });
});
