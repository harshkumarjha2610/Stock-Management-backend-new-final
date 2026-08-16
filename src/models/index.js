const sequelize = require('../config/database');
const Store = require('./store.model');
const User = require('./user.model');
const Product = require('./product.model');
const StockHistory = require('./stockHistory.model');
const Customer = require('./customer.model');
const Bill = require('./bill.model');
const BillItem = require('./billItem.model');
const Staff = require('./staff.model');
const Attendance = require('./attendance.model');
const SalaryPayment = require('./salaryPayment.model');
const ProductSize = require('./productSize.model');
const DiscountRule = require('./discountRule.model');


// ──────────────────────────────────────────────
// Store Associations
// ──────────────────────────────────────────────
Store.hasMany(User, { foreignKey: 'store_id', as: 'users', onDelete: 'CASCADE' });
Store.hasMany(Product, { foreignKey: 'store_id', as: 'products', onDelete: 'CASCADE' });
Store.hasMany(Customer, { foreignKey: 'store_id', as: 'customers', onDelete: 'CASCADE' });
Store.hasMany(Bill, { foreignKey: 'store_id', as: 'bills', onDelete: 'CASCADE' });
Store.hasMany(StockHistory, { foreignKey: 'store_id', as: 'stockHistory', onDelete: 'CASCADE' });
Store.hasMany(Staff, { foreignKey: 'store_id', as: 'staff', onDelete: 'CASCADE' });
Store.hasMany(Attendance, { foreignKey: 'store_id', as: 'attendance', onDelete: 'CASCADE' });
Store.hasMany(SalaryPayment, { foreignKey: 'store_id', as: 'salaryPayments', onDelete: 'CASCADE' });
Store.hasMany(DiscountRule, { foreignKey: 'store_id', as: 'discountRules', onDelete: 'CASCADE' });


// ──────────────────────────────────────────────
// User Associations
// ──────────────────────────────────────────────
User.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
User.hasMany(Bill, { foreignKey: 'billed_by', as: 'billsBilled' });

// ──────────────────────────────────────────────
// Product Associations
// ──────────────────────────────────────────────
Product.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Product.hasMany(StockHistory, { foreignKey: 'product_id', as: 'stockHistory' });
Product.hasMany(BillItem, { foreignKey: 'product_id', as: 'billItems' });
Product.hasMany(ProductSize, { foreignKey: 'product_id', as: 'sizes' });

// ──────────────────────────────────────────────
// ProductSize Associations
// ──────────────────────────────────────────────
ProductSize.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });


// ──────────────────────────────────────────────
// StockHistory Associations
// ──────────────────────────────────────────────
StockHistory.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
StockHistory.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ──────────────────────────────────────────────
// Customer Associations
// ──────────────────────────────────────────────
Customer.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Customer.hasMany(Bill, { foreignKey: 'customer_id', as: 'bills' });

// ──────────────────────────────────────────────
// Bill Associations
// ──────────────────────────────────────────────
Bill.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Bill.belongsTo(Customer, { foreignKey: 'customer_id', as: 'customer' });
Bill.belongsTo(User, { foreignKey: 'billed_by', as: 'biller' });
Bill.hasMany(BillItem, { foreignKey: 'bill_id', as: 'items' });

// ──────────────────────────────────────────────
// BillItem Associations
// ──────────────────────────────────────────────
BillItem.belongsTo(Bill, { foreignKey: 'bill_id', as: 'bill' });
BillItem.belongsTo(Product, { foreignKey: 'product_id', as: 'product' });

// ──────────────────────────────────────────────
// Staff Associations
// ──────────────────────────────────────────────
Staff.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });
Staff.hasMany(Attendance, { foreignKey: 'staff_id', as: 'attendance' });
Staff.hasMany(SalaryPayment, { foreignKey: 'staff_id', as: 'salaryPayments' });

// ──────────────────────────────────────────────
// Attendance Associations
// ──────────────────────────────────────────────
Attendance.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });
Attendance.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

// ──────────────────────────────────────────────
// SalaryPayment Associations
// ──────────────────────────────────────────────
SalaryPayment.belongsTo(Staff, { foreignKey: 'staff_id', as: 'staff' });
SalaryPayment.belongsTo(Store, { foreignKey: 'store_id', as: 'store' });

module.exports = {
  sequelize,
  Store,
  User,
  Product,
  StockHistory,
  Customer,
  Bill,
  BillItem,
  Staff,
  Attendance,
  SalaryPayment,
  ProductSize,
  DiscountRule,
};
