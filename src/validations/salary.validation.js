const Joi = require('joi');

const createSalaryPaymentSchema = Joi.object({
  staff_id: Joi.number().integer().positive().required(),
  month: Joi.string().pattern(/^\d{4}-\d{2}$/).required().messages({
    'string.pattern.base': 'Month must be in YYYY-MM format',
  }),
  amount: Joi.number().min(0).required(),
  payment_method: Joi.string().valid('CASH', 'UPI', 'CARD', 'BANK_TRANSFER').default('CASH'),
  paid_date: Joi.date().iso().allow(null),
  status: Joi.string().valid('PAID', 'PENDING').default('PAID'),
});

const updateSalaryPaymentSchema = Joi.object({
  payment_method: Joi.string().valid('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'Bank Transfer', 'Cash', 'Upi', 'Card').allow(null, ''),
  paid_date: Joi.date().iso().allow(null, ''),
  status: Joi.string().valid('PAID', 'PENDING', 'Paid', 'Pending').default('PAID'),
});

module.exports = { createSalaryPaymentSchema, updateSalaryPaymentSchema };
