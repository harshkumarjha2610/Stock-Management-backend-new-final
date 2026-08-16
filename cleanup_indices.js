const sequelize = require('./src/config/database');

async function cleanup() {
  const [indices] = await sequelize.query(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'products' AND indexname LIKE 'products_barcode%';
  `);

  for (const idx of indices) {
    console.log(`Dropping index: ${idx.indexname}`);
    await sequelize.query(`DROP INDEX IF EXISTS "${idx.indexname}" CASCADE`);
  }

  const [constraints] = await sequelize.query(`
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'products'::regclass AND conname LIKE 'products_barcode%';
  `);

  for (const con of constraints) {
    console.log(`Dropping constraint: ${con.conname}`);
    await sequelize.query(`ALTER TABLE products DROP CONSTRAINT IF EXISTS "${con.conname}" CASCADE`);
  }

  console.log('Cleanup complete.');
  process.exit(0);
}

cleanup();
