const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters',
    'any.required': 'Password is required',
  }),
});

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().allow('', null).max(20).optional(),
  password: Joi.string().min(6).max(128).required(),
  role: Joi.string().valid('ADMIN', 'STAFF').required(),
  store_id: Joi.number().integer().positive().required(),
});

module.exports = { loginSchema, createUserSchema };
