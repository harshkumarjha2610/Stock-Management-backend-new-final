const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const billingService = require('../services/billing.service');

const createBill = catchAsync(async (req, res) => {
  const bill = await billingService.createBill(req.body, req.storeId, req.user.id);
  sendSuccess(res, bill, 'Bill created successfully.', 201);
});

const getBills = catchAsync(async (req, res) => {
  const result = await billingService.getBills(req.storeId, req.query);
  sendSuccess(res, result, 'Bills retrieved successfully.');
});

const getBillById = catchAsync(async (req, res) => {
  const bill = await billingService.getBillById(req.params.id, req.storeId);
  sendSuccess(res, bill, 'Bill retrieved successfully.');
});

module.exports = { createBill, getBills, getBillById };
