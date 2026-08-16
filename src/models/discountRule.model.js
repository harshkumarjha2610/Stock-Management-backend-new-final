const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DiscountRule = sequelize.define('DiscountRule', {
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
  // 'CATEGORY' | 'BRAND' | 'BULK'
  type: {
    type: DataTypes.ENUM('CATEGORY', 'BRAND', 'BULK'),
    allowNull: false,
  },
  // category name, brand name, or rule title for BULK
  target: {
    type: DataTypes.STRING(200),
    allowNull: false,
  },
  // 'percentage' | 'flat'
  discount_type: {
    type: DataTypes.ENUM('percentage', 'flat'),
    allowNull: false,
    defaultValue: 'percentage',
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
  },
  // 'active' | 'inactive' | 'scheduled'
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'scheduled'),
    allowNull: false,
    defaultValue: 'active',
  },
  applies_to_all_brands: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'discount_rules',
  indexes: [
    { name: 'discount_rules_store_id_idx', fields: ['store_id'] },
    { name: 'discount_rules_type_idx', fields: ['type'] },
  ],
});

module.exports = DiscountRule;
