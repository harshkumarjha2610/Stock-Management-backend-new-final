const { User, Store } = require('../models');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

/**
 * Create a new user (Admin or Staff) within a store.
 * Only Super Admin can create Admins; Admins can create Staff.
 */
const createUser = async (data, creatorRole) => {
  // Validate that the target store exists
  const store = await Store.findByPk(data.store_id);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }

  // Permission check: only Super Admin can create Admins
  if (data.role === ROLES.ADMIN && creatorRole !== ROLES.SUPER_ADMIN) {
    throw new AppError('Only Super Admin can create Admin users.', 403);
  }

  // Check for duplicate email
  const existing = await User.findOne({ where: { email: data.email } });
  if (existing) {
    throw new AppError('A user with this email already exists.', 409);
  }

  const user = await User.create({
    name: data.name,
    email: data.email,
    phone: data.phone || null,
    password_hash: data.password, // Will be hashed by beforeCreate hook
    role: data.role,
    store_id: data.store_id,
  });

  return user.toJSON();
};

/**
 * Get user profile by ID.
 */
const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    include: [{ association: 'store', attributes: ['id', 'name'] }],
  });

  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user.toJSON();
};

/**
 * Get all users within a specific store.
 */
const getUsersByStore = async (storeId) => {
  const users = await User.findAll({
    where: { store_id: storeId },
    order: [['created_at', 'DESC']],
  });

  return users;
};

/**
 * Update the last active store for a user.
 */
const updateActiveStore = async (userId, storeId) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // Validate that the store exists
  const store = await Store.findByPk(storeId);
  if (!store) {
    throw new AppError('Store not found.', 404);
  }

  user.last_active_store_id = storeId;
  await user.save();

  return user.toJSON();
};

module.exports = { createUser, getUserById, getUsersByStore, updateActiveStore };
