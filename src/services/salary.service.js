const { SalaryPayment, Staff } = require('../models');
const AppError = require('../utils/AppError');

const createSalaryPayment = async (data, storeId) => {
  // Verify staff belongs to store
  const staff = await Staff.findOne({ where: { id: data.staff_id, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found in this store.', 404);

  const payment = await SalaryPayment.create({ ...data, store_id: storeId });
  return payment;
};

const getSalaryHistory = async (staffId, storeId) => {
  const staff = await Staff.findOne({ where: { id: staffId, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found in this store.', 404);

  return SalaryPayment.findAll({
    where: { staff_id: staffId, store_id: storeId },
    order: [['month', 'DESC']],
  });
};

const getAllSalaries = async (storeId) => {
  return SalaryPayment.findAll({
    where: { store_id: storeId },
    include: [{ association: 'staff', attributes: ['name'] }],
    order: [['month', 'DESC'], ['created_at', 'DESC']],
  });
};

const updateSalaryPayment = async (id, data, storeId) => {
  const payment = await SalaryPayment.findOne({ where: { id, store_id: storeId } });
  if (!payment) throw new AppError('Salary payment not found.', 404);

  const updates = {};
  if (data.status) updates.status = data.status.toUpperCase();
  if (data.payment_method) {
    updates.payment_method = data.payment_method.toUpperCase().replace(' ', '_');
  }
  if (data.paid_date !== undefined) updates.paid_date = data.paid_date || null;

  await payment.update(updates);
  return payment;
};

module.exports = { createSalaryPayment, getSalaryHistory, getAllSalaries, updateSalaryPayment };
