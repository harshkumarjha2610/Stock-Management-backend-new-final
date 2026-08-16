const app = require('./app');
const env = require('./config/env');
const { sequelize } = require('./models');
const prisma = require('./prisma/client');
const seedSuperAdmin = require('./seeders/superAdmin.seed');

const startServer = async () => {
  try {
    // Test Sequelize database connection
    await sequelize.authenticate();
    console.log('✅ Sequelize database connection established successfully.');

    // Sync models — alter:true adds new columns/tables without dropping data
    await sequelize.sync({ alter: true });
    console.log('✅ Sequelize database models synchronized.');

    // Connect Prisma client
    await prisma.$connect();
    console.log('✅ Prisma connected successfully.');

    // Seed default Super Admin
    await seedSuperAdmin();

    // Start Express server
    app.listen(env.port, () => {
      console.log(`🚀 Server running on port ${env.port} in ${env.nodeEnv} mode`);
      console.log(`📋 Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
