const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductSize = sequelize.define('ProductSize', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  product_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'products', key: 'id' },
  },
  size: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  barcode_image_url: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'product_sizes',
  indexes: [
    { fields: ['product_id'] },
    { unique: true, fields: ['product_id', 'size'] },
    { fields: ['barcode'] },
  ],
});

module.exports = ProductSize;
