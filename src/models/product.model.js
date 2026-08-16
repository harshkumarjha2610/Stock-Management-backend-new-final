const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Product = sequelize.define('Product', {
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
  name: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  barcode: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  sku: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  buying_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },

  selling_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
  },

  gst_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0,
  },

  stock_quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  min_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 5,
  },

  status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
    defaultValue: 'ACTIVE',
  },

  barcode_image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  fabric: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  color: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  gender: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },

  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  unit: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },

  hsn_code: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },

  expiry_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  mfg_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  // ============================
  // Purchase Information
  // ============================

  invoice_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },

  purchase_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },

  discount_percent: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    defaultValue: null,
    comment: 'Applied discount percentage from a discount rule',
  },

  discounted_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: true,
    defaultValue: null,
    comment: 'Computed discounted selling price; null means no active discount',
  },

}, {
  tableName: 'products',

  indexes: [
    {
      name: 'products_store_id_idx',
      fields: ['store_id'],
    },
    {
      name: 'products_store_barcode_unique',
      unique: true,
      fields: ['store_id', 'barcode'],
    },
    {
      name: 'products_store_sku_unique',
      unique: true,
      fields: ['store_id', 'sku'],
    },
    {
      name: 'products_category_idx',
      fields: ['category'],
    },
    {
      name: 'products_status_idx',
      fields: ['status'],
    },
  ],
});

module.exports = Product;