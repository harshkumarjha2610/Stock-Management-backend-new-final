const { User, Store } = require('../models');
const ROLES = require('../constants/roles');
const env = require('../config/env');

/**
 * Seeds a default Super Admin and Demo Staff user if they don't already exist.
 * Credentials are read from environment variables or standard defaults.
 */
const seedSuperAdmin = async () => {
  try {
    const existing = await User.findOne({
      where: { role: ROLES.SUPER_ADMIN },
    });

    if (existing) {
      console.log('ℹ️  Super Admin already exists, skipping seed.');
    } else {
      await User.create({
        name: env.superAdmin.name,
        email: env.superAdmin.email,
        password_hash: env.superAdmin.password, // Hashed by beforeCreate hook
        role: ROLES.SUPER_ADMIN,
        store_id: null, // Super Admin is not tied to any store
        status: 'ACTIVE',
      });
      console.log(`✅ Super Admin seeded: ${env.superAdmin.email}`);
    }

    // Seed Demo Staff account for testing role-based visibility
    const existingStaff = await User.findOne({
      where: { email: 'staff@stockmgmt.com' },
    });

    if (!existingStaff) {
      const store = await Store.findOne();
      await User.create({
        name: 'Demo Staff',
        email: 'staff@stockmgmt.com',
        password_hash: 'Staff@123', // Hashed by beforeCreate hook
        role: ROLES.STAFF,
        store_id: store ? store.id : null,
        status: 'ACTIVE',
      });
      console.log('✅ Demo Staff seeded: staff@stockmgmt.com');
    }
  } catch (error) {
    console.error('⚠️  Seed failed:', error.message);
  }
};

module.exports = seedSuperAdmin;
