const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const discountService = require('../services/discount.service');

/**
 * POST /discounts/category
 * Body: { category, discount_type, value, status, applies_to_all_brands }
 */
const applyCategoryDiscount = catchAsync(async (req, res) => {
  const { category, discount_type, value, status, applies_to_all_brands } = req.body;
  const result = await discountService.applyCategoryDiscount(req.storeId, {
    category,
    discount_type,
    value,
    status,
    applies_to_all_brands,
  });
  sendSuccess(res, result, `Discount applied to ${result.affectedCount} product(s) in "${category}".`, 201);
});

/**
 * GET /discounts/category
 */
const getCategoryRules = catchAsync(async (req, res) => {
  const rules = await discountService.getCategoryRules(req.storeId);
  sendSuccess(res, rules, 'Category discount rules retrieved.');
});

/**
 * POST /discounts/brand
 * Body: { brand, discount_type, value, status }
 */
const applyBrandDiscount = catchAsync(async (req, res) => {
  const { brand, discount_type, value, status } = req.body;
  const result = await discountService.applyBrandDiscount(req.storeId, {
    brand,
    discount_type,
    value,
    status,
  });
  sendSuccess(res, result, `Discount applied to ${result.affectedCount} product(s) for brand "${brand}".`, 201);
});

/**
 * GET /discounts/brand
 */
const getBrandRules = catchAsync(async (req, res) => {
  const rules = await discountService.getBrandRules(req.storeId);
  sendSuccess(res, rules, 'Brand discount rules retrieved.');
});

/**
 * DELETE /discounts/:id
 */
const deleteDiscountRule = catchAsync(async (req, res) => {
  const result = await discountService.deleteDiscountRule(req.params.id, req.storeId);
  sendSuccess(res, result, result.message);
});

module.exports = { applyCategoryDiscount, getCategoryRules, applyBrandDiscount, getBrandRules, deleteDiscountRule };
