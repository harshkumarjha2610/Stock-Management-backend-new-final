const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const customerService = require('../services/customer.service');

const createCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.createCustomer(req.body, req.storeId);
  sendSuccess(res, customer, 'Customer created successfully.', 201);
});

const getCustomers = catchAsync(async (req, res) => {
  const result = await customerService.getCustomers(req.storeId, req.query);
  sendSuccess(res, result, 'Customers retrieved successfully.');
});

const getCustomerById = catchAsync(async (req, res) => {
  const customer = await customerService.getCustomerById(req.params.id, req.storeId);
  sendSuccess(res, customer, 'Customer retrieved successfully.');
});

const updateCustomer = catchAsync(async (req, res) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body, req.storeId);
  sendSuccess(res, customer, 'Customer updated successfully.');
});

const deleteCustomer = catchAsync(async (req, res) => {
  const result = await customerService.deleteCustomer(req.params.id, req.storeId);
  sendSuccess(res, result, 'Customer deleted successfully.');
});

const getPurchaseHistory = catchAsync(async (req, res) => {
  const result = await customerService.getPurchaseHistory(req.params.id, req.storeId, req.query);
  sendSuccess(res, result, 'Purchase history retrieved.');
});

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, getPurchaseHistory };
