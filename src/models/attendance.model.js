const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
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
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  check_in: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  check_out: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  working_hours: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Calculated hours between check-in and check-out',
  },
  status: {
    type: DataTypes.ENUM('PRESENT', 'ABSENT', 'HALF_DAY'),
    allowNull: false,
    defaultValue: 'PRESENT',
  },
}, {
  tableName: 'attendance',
  indexes: [
    { fields: ['staff_id'] },
    { fields: ['store_id'] },
    { fields: ['date'] },
  ],
});

module.exports = Attendance;
