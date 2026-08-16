const Joi = require('joi');

const createStaffSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
  aadhar_card: Joi.string().max(20).allow('', null),
  email_id: Joi.string().email().max(150).required(),
  password: Joi.string().min(6).max(100).required(),
  photo_url: Joi.string().allow('', null),
  base_salary: Joi.number().min(0).required(),
  joining_date: Joi.date().iso().allow(null, ''),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'Active', 'Inactive')
    .default('ACTIVE'),
});

const updateStaffSchema = Joi.object({
  name: Joi.string().min(1).max(150).required(),
  phone: Joi.string().max(20).allow('', null),
  address: Joi.string().allow('', null),
  aadhar_card: Joi.string().max(20).allow('', null),
  email_id: Joi.string().email().max(150).required(),

  // Optional while editing
  password: Joi.string()
    .min(6)
    .max(100)
    .allow('', null)
    .optional(),

  photo_url: Joi.string().allow('', null),
  base_salary: Joi.number().min(0).required(),
  joining_date: Joi.date().iso().allow(null, ''),
  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE', 'Active', 'Inactive')
    .default('ACTIVE'),
});

module.exports = {
  createStaffSchema,
  updateStaffSchema,
};