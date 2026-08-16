const Joi = require('joi');

const createBillSchema = Joi.object({
  customer_id: Joi.number().integer().positive().allow(null, ''),
  customer_name: Joi.string().max(150).allow('', null),
  customer_phone: Joi.string().pattern(/^[0-9]{10}$/).allow('', null).messages({
    'string.pattern.base': 'Customer phone number must be exactly 10 digits.'
  }),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.number().integer().positive().required(),
      quantity: Joi.number().integer().positive().required(),
      price: Joi.number().min(0),
      discount: Joi.number().min(0).default(0),
      gst_percent: Joi.number().min(0),
      size: Joi.string().max(20).allow('', null),
    })
  ).min(1).required().messages({
    'array.min': 'At least one item is required to create a bill',
  }),
  discount: Joi.number().min(0).default(0),
  discount_percent: Joi.number().min(0).max(100).default(0),
  coins: Joi.number().integer().min(0).default(0),
  amount: Joi.number().min(0),
  cash_received: Joi.number().min(0).default(0),
  payment_method: Joi.string().valid('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'cash', 'upi', 'card', 'bank_transfer', 'Bank Transfer').default('CASH'),
  paid_status: Joi.string().valid('PAID', 'UNPAID', 'PARTIAL', 'Paid', 'Unpaid', 'Partial').default('PAID'),
  type: Joi.string().valid('SALE', 'RETURN', 'sale', 'return').default('SALE'),
});

module.exports = { createBillSchema };
