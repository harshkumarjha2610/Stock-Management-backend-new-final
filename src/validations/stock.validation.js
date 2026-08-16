const Joi = require('joi');

const stockInSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  purchase_price: Joi.number().min(0).allow(null),
  supplier_name: Joi.string().max(200).allow('', null),
  reason: Joi.string().max(500).allow('', null),
});

const stockOutSchema = Joi.object({
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  reason: Joi.string().max(500).allow('', null),
});

module.exports = { stockInSchema, stockOutSchema };
