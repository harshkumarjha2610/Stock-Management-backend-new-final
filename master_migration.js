const sequelize = require('./src/config/database');

async function migrate() {
  const tables = ['bill_items', 'bills', 'stock_history', 'product_sizes', 'products', 'customers', 'staff', 'stores'];
  
  console.log('Cleaning up constraints...');
  for (const table of tables) {
    try {
      const [constraints] = await sequelize.query(`
        SELECT conname 
        FROM pg_constraint 
        WHERE conrelid = '${table}'::regclass AND contype = 'u';
      `);
      for (const con of constraints) {
        console.log(`Dropping unique constraint ${con.conname} from ${table}`);
        await sequelize.query(`ALTER TABLE "${table}" DROP CONSTRAINT IF EXISTS "${con.conname}" CASCADE`);
      }

      const [indices] = await sequelize.query(`
        SELECT indexname 
        FROM pg_indexes 
        WHERE tablename = '${table}' AND indexname LIKE '%_key%' OR indexname LIKE '%_unique%';
      `);
      for (const idx of indices) {
        console.log(`Dropping index ${idx.indexname} from ${table}`);
        await sequelize.query(`DROP INDEX IF EXISTS "${idx.indexname}" CASCADE`);
      }
    } catch (err) {
      console.log(`Table ${table} might not exist yet.`);
    }
  }

  console.log('Syncing models with alter: true...');
  await sequelize.sync({ alter: true });

  console.log('✅ Migration complete.');
  process.exit(0);
}

migrate();
