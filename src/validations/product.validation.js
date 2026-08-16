const Joi = require('joi');

const createProductSchema = Joi.object({
  name: Joi.string().min(1).max(200).required(),

  category: Joi.string().max(100).allow('', null),
  gender: Joi.string().max(50).allow('', null),
  brand: Joi.string().max(100).allow('', null),
  fabric: Joi.string().max(100).allow('', null),
  color: Joi.string().max(100).allow('', null),

  sku: Joi.string().max(100).allow('', null),
  barcode: Joi.string().max(100).allow('', null),

  image_url: Joi.string().allow('', null),

  status: Joi.string()
    .valid('ACTIVE', 'INACTIVE')
    .default('ACTIVE'),

  purchase_price: Joi.number().min(0).required(),
  selling_price: Joi.number().min(0).required(),

  gst_percent: Joi.number().min(0).max(100).default(0),

  stock_quantity: Joi.number().integer().min(0).default(0),

  min_stock_level: Joi.number().integer().min(0).default(5),

  // ============================
  // Purchase Information
  // ============================

  invoice_number: Joi.string()
    .max(100)
    .allow('', null),

  purchase_date: Joi.date()
    .iso()
    .allow(null),

  description: Joi.string().allow('', null),

  unit: Joi.string().max(50).allow('', null),

  hsn_code: Joi.string().max(50).allow('', null),

  expiry_date: Joi.date()
    .iso()
    .allow(null),

  mfg_date: Joi.date()
    .iso()
    .allow(null),

  sizes: Joi.array()
    .items(
      Joi.object({
        size: Joi.string().required(),

        quantity: Joi.number()
          .integer()
          .min(0)
          .default(0),

        barcode: Joi.string()
          .max(100)
          .allow('', null),

        barcode_image_url: Joi.string()
          .allow('', null),
      })
    )
    .allow(null),
});

const updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(200),

  category: Joi.string().max(100).allow('', null),
  gender: Joi.string().max(50).allow('', null),
  brand: Joi.string().max(100).allow('', null),
  fabric: Joi.string().max(100).allow('', null),
  color: Joi.string().max(100).allow('', null),

  sku: Joi.string().max(100).allow('', null),
  barcode: Joi.string().max(100).allow('', null),

  image_url: Joi.string().allow('', null),

  status: Joi.string().valid('ACTIVE', 'INACTIVE'),

  purchase_price: Joi.number().min(0),
  selling_price: Joi.number().min(0),

  gst_percent: Joi.number().min(0).max(100),

  stock_quantity: Joi.number().integer().min(0),

  min_stock_level: Joi.number().integer().min(0),

  // ============================
  // Purchase Information
  // ============================

  invoice_number: Joi.string()
    .max(100)
    .allow('', null),

  purchase_date: Joi.date()
    .iso()
    .allow(null),

  description: Joi.string().allow('', null),

  unit: Joi.string().max(50).allow('', null),

  hsn_code: Joi.string().max(50).allow('', null),

  expiry_date: Joi.date()
    .iso()
    .allow(null),

  mfg_date: Joi.date()
    .iso()
    .allow(null),

  sizes: Joi.array()
    .items(
      Joi.object({
        size: Joi.string().required(),

        quantity: Joi.number()
          .integer()
          .min(0)
          .default(0),

        barcode: Joi.string()
          .max(100)
          .allow('', null),

        barcode_image_url: Joi.string()
          .allow('', null),
      })
    )
    .allow(null),

}).min(1);

module.exports = {
  createProductSchema,
  updateProductSchema,
};