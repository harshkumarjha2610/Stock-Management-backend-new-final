const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  owner_name: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { isEmail: true },
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
    address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  category: {
    type: DataTypes.ENUM('GROCERY', 'GARMENTS'),
    defaultValue: 'GROCERY',
  },
  logo_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  upi_id: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  upi_payee_name: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
}, {
  tableName: 'stores',
});

module.exports = Store;
