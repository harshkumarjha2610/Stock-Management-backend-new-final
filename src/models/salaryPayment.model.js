const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const PAYMENT_METHODS = require('../constants/paymentMethods');

const SalaryPayment = sequelize.define('SalaryPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  staff_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'staff', key: 'id' },
  },
  store_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'stores', key: 'id' },
  },
  month: {
    type: DataTypes.STRING(7),
    allowNull: false,
    comment: 'Format: YYYY-MM',
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false,
  },
  paid_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  payment_method: {
    type: DataTypes.ENUM(Object.values(PAYMENT_METHODS)),
    allowNull: false,
    defaultValue: PAYMENT_METHODS.CASH,
  },
  status: {
    type: DataTypes.ENUM('PAID', 'PENDING'),
    allowNull: false,
    defaultValue: 'PAID',
  },
}, {
  tableName: 'salary_payments',
  indexes: [
    { fields: ['staff_id'] },
    { fields: ['store_id'] },
    { fields: ['month'] },
  ],
});

module.exports = SalaryPayment;
