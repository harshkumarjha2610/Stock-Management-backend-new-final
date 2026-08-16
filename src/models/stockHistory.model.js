const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const STOCK_TYPES = require('../constants/stockTypes');

const StockHistory = sequelize.define('StockHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' },
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  type: {
    type: DataTypes.ENUM(Object.values(STOCK_TYPES)),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  purchase_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
  },
  reason: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  supplier_name: {
    type: DataTypes.STRING(200),
    allowNull: true,
  },
  note: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
}, {
  tableName: 'stock_history',
  indexes: [
    { fields: ['store_id'] },
    { fields: ['product_id'] },
    { fields: ['created_at'] },
  ],
});

module.exports = StockHistory;
