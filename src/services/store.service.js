const { Store, User } = require('../models');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

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

const deleteStore = async (id) => {
  const store = await getStoreById(id);
  await store.destroy();
  return { id };
};

module.exports = { createStore, getAllStores, getStoreById, updateStore, deleteStore };
