const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const stockService = require('../services/stock.service');

const stockIn = catchAsync(async (req, res) => {
  const result = await stockService.stockIn(req.body, req.storeId);
  sendSuccess(res, result, 'Stock added successfully.', 201);
});

const stockOut = catchAsync(async (req, res) => {
  const result = await stockService.stockOut(req.body, req.storeId);
  sendSuccess(res, result, 'Stock removed successfully.');
});

const getStockHistory = catchAsync(async (req, res) => {
  const result = await stockService.getStockHistory(req.storeId, req.query);
  sendSuccess(res, result, 'Stock history retrieved.');
});

const getLowStockProducts = catchAsync(async (req, res) => {
  const products = await stockService.getLowStockProducts(req.storeId);
  sendSuccess(res, products, 'Low stock products retrieved.');
});

module.exports = { stockIn, stockOut, getStockHistory, getLowStockProducts };
