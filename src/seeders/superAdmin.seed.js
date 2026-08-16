const { User } = require('../models');
const ROLES = require('../constants/roles');
const env = require('../config/env');

/**
 * Seeds a default Super Admin user if one doesn't already exist.
 * Credentials are read from environment variables.
 */
const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({
      where: { role: ROLES.SUPER_ADMIN },
    });

    if (existing) {
      console.log('ℹ️  Super Admin already exists, skipping seed.');
      return;
    }

    await User.create({
      name: env.superAdmin.name,
      email: env.superAdmin.email,
      password_hash: env.superAdmin.password, // Hashed by beforeCreate hook
      role: ROLES.SUPER_ADMIN,
      store_id: null, // Super Admin is not tied to any store
      status: 'ACTIVE',
    });

    console.log(`✅ Super Admin seeded: ${env.superAdmin.email}`);
  } catch (error) {
    console.error('⚠️  Super Admin seed failed:', error.message);
  }
};

module.exports = seedSuperAdmin;
