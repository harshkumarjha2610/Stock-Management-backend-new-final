const sequelize = require('./src/config/database');
const models = require('./src/models'); // This will load all models

async function forceReset() {
  console.log('Force resetting database...');
  await sequelize.sync({ force: true });
  console.log('✅ All tables dropped and recreated with correct schema.');
  process.exit(0);
}

forceReset();
