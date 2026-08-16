const { Product, DiscountRule, sequelize } = require('../models');
const { Op } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Apply a category-level discount to all products in the given category.
 * Saves a DiscountRule record and bulk-updates each product's discounted_price.
 * The original selling_price is never modified.
 */
const applyCategoryDiscount = async (storeId, { category, discount_type, value, status, applies_to_all_brands }) => {
  const transaction = await sequelize.transaction();
  try {
    const discountValue = parseFloat(value);
    if (isNaN(discountValue) || discountValue <= 0) {
      throw new AppError('Discount value must be a positive number.', 400);
    }
    if (!category) {
      throw new AppError('Category is required.', 400);
    }

    // Find all matching products for this store + category
    const products = await Product.findAll({
      where: { store_id: storeId, category },
      transaction,
    });

    if (products.length === 0) {
      throw new AppError(`No products found in category "${category}".`, 404);
    }

    // Compute and apply discounted_price for each product
    for (const product of products) {
      const originalPrice = parseFloat(product.selling_price);
      let newDiscountedPrice;

      if (discount_type === 'percentage') {
        newDiscountedPrice = parseFloat((originalPrice - (originalPrice * discountValue) / 100).toFixed(2));
      } else {
        // flat discount
        newDiscountedPrice = parseFloat((originalPrice - discountValue).toFixed(2));
        if (newDiscountedPrice < 0) newDiscountedPrice = 0;
      }

      await product.update(
        {
          discounted_price: newDiscountedPrice,
          discount_percent: discount_type === 'percentage' ? discountValue : null,
        },
        { transaction }
      );
    }

    // Remove any existing CATEGORY rule for this category in this store
    // so we don't accumulate duplicate rules for the same category
    await DiscountRule.destroy({
      where: { store_id: storeId, type: 'CATEGORY', target: category },
      transaction,
    });

    // Save the new rule record
    const rule = await DiscountRule.create(
      {
        store_id: storeId,
        type: 'CATEGORY',
        target: category,
        discount_type,
        value: discountValue,
        status: status || 'active',
        applies_to_all_brands: applies_to_all_brands !== false,
      },
      { transaction }
    );

    await transaction.commit();
    return { rule, affectedCount: products.length };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get all category discount rules for a store.
 */
const getCategoryRules = async (storeId) => {
  return DiscountRule.findAll({
    where: { store_id: storeId, type: 'CATEGORY' },
    order: [['created_at', 'DESC']],
  });
};

/**
 * Apply a brand-level discount to all products of the given brand.
 * Saves a DiscountRule record and bulk-updates each product's discounted_price.
 * The original selling_price is never modified.
 */
const applyBrandDiscount = async (storeId, { brand, discount_type, value, status }) => {
  const transaction = await sequelize.transaction();
  try {
    const discountValue = parseFloat(value);
    if (isNaN(discountValue) || discountValue <= 0) {
      throw new AppError('Discount value must be a positive number.', 400);
    }
    if (!brand) {
      throw new AppError('Brand is required.', 400);
    }

    // Find all matching products for this store + brand
    const products = await Product.findAll({
      where: { store_id: storeId, brand },
      transaction,
    });

    if (products.length === 0) {
      throw new AppError(`No products found for brand "${brand}".`, 404);
    }

    // Compute and apply discounted_price for each product
    for (const product of products) {
      const originalPrice = parseFloat(product.selling_price);
      let newDiscountedPrice;

      if (discount_type === 'percentage') {
        newDiscountedPrice = parseFloat((originalPrice - (originalPrice * discountValue) / 100).toFixed(2));
      } else {
        // flat discount
        newDiscountedPrice = parseFloat((originalPrice - discountValue).toFixed(2));
        if (newDiscountedPrice < 0) newDiscountedPrice = 0;
      }

      await product.update(
        {
          discounted_price: newDiscountedPrice,
          discount_percent: discount_type === 'percentage' ? discountValue : null,
        },
        { transaction }
      );
    }

    // Remove any existing BRAND rule for this brand in this store
    await DiscountRule.destroy({
      where: { store_id: storeId, type: 'BRAND', target: brand },
      transaction,
    });

    // Save the new rule record
    const rule = await DiscountRule.create(
      {
        store_id: storeId,
        type: 'BRAND',
        target: brand,
        discount_type,
        value: discountValue,
        status: status || 'active',
        applies_to_all_brands: true,
      },
      { transaction }
    );

    await transaction.commit();
    return { rule, affectedCount: products.length };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

/**
 * Get all brand discount rules for a store.
 */
const getBrandRules = async (storeId) => {
  return DiscountRule.findAll({
    where: { store_id: storeId, type: 'BRAND' },
    order: [['created_at', 'DESC']],
  });
};

/**
 * Delete a discount rule and reset discounted_price for all affected products.
 */
const deleteDiscountRule = async (ruleId, storeId) => {
  const transaction = await sequelize.transaction();
  try {
    const rule = await DiscountRule.findOne({
      where: { id: ruleId, store_id: storeId },
      transaction,
    });

    if (!rule) throw new AppError('Discount rule not found.', 404);

    // Reset discounted_price and discount_percent for affected products
    if (rule.type === 'CATEGORY') {
      await Product.update(
        { discounted_price: null, discount_percent: null },
        { where: { store_id: storeId, category: rule.target }, transaction }
      );
    } else if (rule.type === 'BRAND') {
      await Product.update(
        { discounted_price: null, discount_percent: null },
        { where: { store_id: storeId, brand: rule.target }, transaction }
      );
    }

    await rule.destroy({ transaction });
    await transaction.commit();
    return { message: 'Discount rule deleted and prices restored.', rule };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
};

module.exports = { applyCategoryDiscount, getCategoryRules, applyBrandDiscount, getBrandRules, deleteDiscountRule };
