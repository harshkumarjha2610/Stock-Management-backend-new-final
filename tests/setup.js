/**
 * Test Setup — Initializes the Express app with a test database.
 * Uses the same app instance but connects to a separate test DB
 * (or the same DB with table cleanup).
 */
const app = require('../src/app');
const { sequelize } = require('../src/models');
const seedSuperAdmin = require('../src/seeders/superAdmin.seed');

/**
 * Initialize the database for testing:
 * - Force sync (drops & recreates all tables)
 * - Seed the super admin
 */
const setupDatabase = async () => {
  await sequelize.sync({ force: true });
  await seedSuperAdmin();
};

/**
 * Close the database connection after all tests.
 */
const teardownDatabase = async () => {
  // We avoid closing the connection here because multiple test files
  // share the same sequelize singleton in the same process when running in band.
  // Jest's --forceExit will take care of closing the process.
};

module.exports = { app, sequelize, setupDatabase, teardownDatabase };
