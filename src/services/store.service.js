const { Store, User, Product, StockHistory, Bill, BillItem, Customer, Staff, Attendance, SalaryPayment, ProductSize, DiscountRule } = require('../models');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');
const { sequelize } = require('../models');

/**
 * Handle sync of admins for a store.
 */
const syncAdmins = async (storeId, adminsData) => {
  if (!adminsData || !Array.isArray(adminsData)) return;

  for (const adminData of adminsData) {
    // If the admin has a password, we include it. Otherwise omit so we don't overwrite with empty
    const userData = {
      name: adminData.name,
      role: ROLES.ADMIN,
      store_id: storeId,
      phone: adminData.phone || null,
    };
    if (adminData.password) {
      userData.password_hash = adminData.password;
    }
    // Upsert or findOrCreate based on email
    const [user, created] = await User.findOrCreate({
      where: { email: adminData.email },
      defaults: {
        ...userData,
        password_hash: adminData.password || 'defaultPassword123!', // Require password on create
      }
    });

    if (!created) {
      await user.update(userData);
    }
  }
};

/**
 * Create a new store.
 */
const createStore = async (data) => {
  const store = await Store.create(data);
  if (data.admins) {
    await syncAdmins(store.id, data.admins);
  }
  return getStoreById(store.id);
};

/**
 * Get all stores.
 */
const getAllStores = async (filter = {}) => {
  const stores = await Store.findAll({
    where: filter,
    order: [['created_at', 'DESC']],
    include: [{
      model: User,
      as: 'users',
      where: { role: ROLES.ADMIN },
      required: false,
      attributes: ['id', 'name', 'email', 'phone', 'role'] // Exclude password_hash
    }]
  });
  return stores;
};

/**
 * Get a single store by ID.
 */
const getStoreById = async (id) => {
  const store = await Store.findByPk(id, {
    include: [{
      model: User,
      as: 'users',
      where: { role: ROLES.ADMIN },
      required: false,
      attributes: ['id', 'name', 'email', 'phone', 'role']
    }]
  });
  if (!store) {
    throw new AppError('Store not found.', 404);
  }
  return store;
};

const updateStore = async (id, data) => {
  const store = await getStoreById(id);
  await store.update(data);
  
  if (data.admins) {
    await syncAdmins(store.id, data.admins);
  }

  return getStoreById(id);
};

/**
 * Delete a store and all its related data manually (since DB FKs may not have CASCADE).
 * Order matters: deepest child tables first, then parents.
 */
const deleteStore = async (id) => {
  const store = await Store.findByPk(id);
  if (!store) throw new AppError('Store not found.', 404);

  await sequelize.transaction(async (t) => {
    const opts = { where: { store_id: id }, transaction: t };

    // 1. Get all product IDs for this store (needed to delete ProductSizes)
    const products = await Product.findAll({ where: { store_id: id }, attributes: ['id'], transaction: t });
    const productIds = products.map((p) => p.id);

    // 2. Get all bill IDs for this store (needed to delete BillItems)
    const bills = await Bill.findAll({ where: { store_id: id }, attributes: ['id'], transaction: t });
    const billIds = bills.map((b) => b.id);

    // 3. Get all staff IDs for this store (needed to delete Attendance & SalaryPayments)
    const staffList = await Staff.findAll({ where: { store_id: id }, attributes: ['id'], transaction: t });
    const staffIds = staffList.map((s) => s.id);

    // Delete deepest children first
    if (billIds.length > 0) {
      await BillItem.destroy({ where: { bill_id: billIds }, transaction: t });
    }
    if (productIds.length > 0) {
      await ProductSize.destroy({ where: { product_id: productIds }, transaction: t });
    }

    await Attendance.destroy({ where: { store_id: id }, transaction: t });
    await SalaryPayment.destroy({ where: { store_id: id }, transaction: t });
    await StockHistory.destroy(opts);
    await Bill.destroy(opts);
    await Customer.destroy(opts);
    await DiscountRule.destroy(opts);
    await Product.destroy(opts);
    await Staff.destroy(opts);
    await User.destroy(opts);

    // Finally delete the store itself
    await store.destroy({ transaction: t });
  });

  return { id };
};

module.exports = { createStore, getAllStores, getStoreById, updateStore, deleteStore };

