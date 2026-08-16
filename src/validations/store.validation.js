const Joi = require('joi');

const adminSchema = Joi.object({
  id: Joi.string().optional(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null),
  password: Joi.string().min(6).optional().allow('', null), // Optional on update
});

const createStoreSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  owner_name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
  category: Joi.string().valid('GROCERY', 'GARMENTS').default('GROCERY'),
  logo_url: Joi.string().allow('', null),
  upi_id: Joi.string().allow('', null),
  upi_payee_name: Joi.string().max(150).allow('', null),
  admins: Joi.array().items(adminSchema).optional(),
});

const updateStoreSchema = Joi.object({
  name: Joi.string().min(2).max(150),
  owner_name: Joi.string().min(2).max(150),
  email: Joi.string().email().allow('', null),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
  category: Joi.string().valid('GROCERY', 'GARMENTS'),
  logo_url: Joi.string().allow('', null),
  upi_id: Joi.string().allow('', null),
  upi_payee_name: Joi.string().max(150).allow('', null),
  admins: Joi.array().items(adminSchema).optional(),
}).min(1);

module.exports = { createStoreSchema, updateStoreSchema };
