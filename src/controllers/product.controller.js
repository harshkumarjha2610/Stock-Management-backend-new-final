const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const productService = require('../services/product.service');

const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.body, req.storeId);
  sendSuccess(res, product, 'Product created with barcode.', 201);
});

const getProducts = catchAsync(async (req, res) => {
  const result = await productService.getProducts(req.storeId, req.query);
  sendSuccess(res, result, 'Products retrieved successfully.');
});

const getProductById = catchAsync(async (req, res) => {
  const product = await productService.getProductById(req.params.id, req.storeId);
  sendSuccess(res, product, 'Product retrieved successfully.');
});

// ===============================
// NEW CONTROLLER
// ===============================
const getDropdownValues = catchAsync(async (req, res) => {
  const values = await productService.getDropdownValues(req.storeId);
  sendSuccess(res, values, 'Dropdown values retrieved successfully.');
});

const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(
    req.params.id,
    req.body,
    req.storeId
  );
  sendSuccess(res, product, 'Product updated successfully.');
});

const deleteProduct = catchAsync(async (req, res) => {
  const result = await productService.deleteProduct(
    req.params.id,
    req.storeId
  );
  sendSuccess(res, result, 'Product deleted successfully.');
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getDropdownValues,
  updateProduct,
  deleteProduct,
};