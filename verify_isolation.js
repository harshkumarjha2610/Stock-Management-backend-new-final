const { Product, Store, User } = require('./src/models');
const productService = require('./src/services/product.service');
const sequelize = require('./src/config/database');

async function verify() {
  // Force drop old unique constraint to allow composite index creation
  try {
    await sequelize.query('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_barcode_key');
    await sequelize.query('ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key');
    console.log('Old constraints dropped.');
  } catch (err) {
    console.log('No old constraints to drop.');
  }
  
  await sequelize.sync({ alter: true });

  // 1. Create two stores
  const store1 = await Store.create({ name: 'Store A', owner_name: 'Owner A' });
  const store2 = await Store.create({ name: 'Store B', owner_name: 'Owner B' });

  console.log(`Created Stores: ${store1.id}, ${store2.id}`);

  // 2. Create products with SAME barcode in different stores
  try {
    await Product.create({
      name: 'Product A',
      barcode: 'BAR001',
      buying_price: 100,
      selling_price: 200,
      store_id: store1.id
    });
    console.log('Product A created in Store 1');

    await Product.create({
      name: 'Product B',
      barcode: 'BAR001', // Same barcode
      buying_price: 150,
      selling_price: 250,
      store_id: store2.id
    });
    console.log('Product B created in Store 2 (Same barcode allowed!)');
  } catch (err) {
    console.error('Failed to create products with same barcode:', err.message);
  }

  // 3. Verify isolation
  const allProducts = await Product.findAll();
  console.log(`Total Products in DB: ${allProducts.length}`);
  allProducts.forEach(p => console.log(`- ${p.name} (ID: ${p.id}, Store: ${p.store_id}, Barcode: ${p.barcode})`));

  const productsStore1 = await productService.getProducts(store1.id);
  const productsStore2 = await productService.getProducts(store2.id);

  console.log(`Store 1 (ID: ${store1.id}) Products: ${productsStore1.length}`);
  console.log(`Store 2 (ID: ${store2.id}) Products: ${productsStore2.length}`);

  if (productsStore1.length === 1 && productsStore1[0].name === 'Product A' &&
      productsStore2.length === 1 && productsStore2[0].name === 'Product B') {
    console.log('✅ Multi-store isolation verified!');
  } else {
    console.error('❌ Multi-store isolation FAILED!');
  }

  process.exit(0);
}

verify();
