const { Product, StockHistory } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const AppError = require('../utils/AppError');
const STOCK_TYPES = require('../constants/stockTypes');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

/**
 * Stock In: Increase product quantity and record history.
 */
const stockIn = async (data, storeId) => {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findOne({
      where: { id: data.product_id, store_id: storeId },
      transaction,
      lock: true, // Row-level lock for concurrency safety
    });

    if (!product) {
      throw new AppError('Product not found in this store.', 404);
    }

    // Increase stock quantity
    await product.increment('stock_quantity', {
      by: data.quantity,
      transaction,
    });

    // Optionally update purchase price if provided
    if (data.purchase_price !== undefined && data.purchase_price !== null) {
      await product.update({ purchase_price: data.purchase_price }, { transaction });
    }

    // Create stock history record
    const history = await StockHistory.create({
      store_id: storeId,
      product_id: data.product_id,
      type: STOCK_TYPES.IN,
      quantity: data.quantity,
      purchase_price: data.purchase_price || product.purchase_price,
      reason: data.reason || 'Stock replenishment',
      supplier_name: data.supplier_name || null,
      note: data.note || null,
    }, { transaction });

    await transaction.commit();

    return {
      history,
      new_stock_quantity: product.stock_quantity,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Stock Out: Decrease product quantity with sufficiency check.
 */
const stockOut = async (data, storeId) => {
  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findOne({
      where: { id: data.product_id, store_id: storeId },
      transaction,
      lock: true,
    });

    if (!product) {
      throw new AppError('Product not found in this store.', 404);
    }

    // Insufficient stock check
    if (product.stock_quantity < data.quantity) {
      throw new AppError(
        `Insufficient stock. Available: ${product.stock_quantity}, Requested: ${data.quantity}`,
        400
      );
    }

    // Decrease stock quantity
    await product.decrement('stock_quantity', {
      by: data.quantity,
      transaction,
    });

    // Create stock history record
    const history = await StockHistory.create({
      store_id: storeId,
      product_id: data.product_id,
      type: STOCK_TYPES.OUT,
      quantity: data.quantity,
      reason: data.reason || 'Manual stock out',
      note: data.note || null,
    }, { transaction });

    await transaction.commit();

    return {
      history,
      new_stock_quantity: product.stock_quantity,
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get paginated stock history with optional filters.
 */
const getStockHistory = async (storeId, query) => {
  const { page, limit, offset } = parsePagination(query);

  const where = { store_id: storeId };

  if (query.product_id) {
    where.product_id = query.product_id;
  }

  if (query.type) {
    where.type = query.type;
  }

  // Date range filter
  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }

  const { rows, count } = await StockHistory.findAndCountAll({
    where,
    include: [
      { association: 'product', attributes: ['id', 'name', 'barcode'] },
    ],
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });

  // If 'page' is not provided, the frontend likely expects the full array for reports
  if (!query.page) return rows;

  return paginatedResponse(rows, count, page, limit);
};

/**
 * Get products where stock_quantity is at or below min_stock_level.
 */
const getLowStockProducts = async (storeId) => {
  const products = await Product.findAll({
    where: {
      store_id: storeId,
      stock_quantity: {
        [Op.lte]: sequelize.col('min_stock_level'),
      },
    },
    order: [['stock_quantity', 'ASC']],
  });

  return products;
};

module.exports = { stockIn, stockOut, getStockHistory, getLowStockProducts };
