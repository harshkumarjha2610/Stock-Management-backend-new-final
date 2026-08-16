const sequelize = require('./src/config/database');

async function checkIndices() {
  const [indices] = await sequelize.query(`
    SELECT
        t.relname as table_name,
        i.relname as index_name,
        a.attname as column_name,
        ix.indisunique as is_unique
    FROM
        pg_class t,
        pg_class i,
        pg_index ix,
        pg_attribute a
    WHERE
        t.oid = ix.indrelid
        AND i.oid = ix.indexrelid
        AND a.attrelid = t.oid
        AND a.attnum = ANY(ix.indkey)
        AND t.relkind = 'r'
        AND t.relname = 'products'
    ORDER BY
        t.relname,
        i.relname;
  `);

  console.log('Indices for table "products":');
  console.table(indices);

  const [constraints] = await sequelize.query(`
    SELECT conname, contype 
    FROM pg_constraint 
    WHERE conrelid = 'products'::regclass;
  `);

  console.log('Constraints for table "products":');
  console.table(constraints);

  process.exit(0);
}

checkIndices();
