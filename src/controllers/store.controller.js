const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const storeService = require('../services/store.service');
const ROLES = require('../constants/roles');
const AppError = require('../utils/AppError');

const createStore = catchAsync(async (req, res) => {
  const store = await storeService.createStore(req.body);
  sendSuccess(res, store, 'Store created successfully.', 201);
});

const getAllStores = catchAsync(async (req, res) => {
  let filter = {};
  
  // If not Super Admin, strictly limit to their assigned store
  if (req.user.role !== ROLES.SUPER_ADMIN) {
    if (!req.user.store_id) {
      return next(new AppError('Store context is required for this user role.', 400));
    }
    filter = { id: req.user.store_id };
  }

  const stores = await storeService.getAllStores(filter);
  sendSuccess(res, stores, 'Stores retrieved successfully.');
});

const getStoreById = catchAsync(async (req, res) => {
  const store = await storeService.getStoreById(req.params.id);
  sendSuccess(res, store, 'Store retrieved successfully.');
});

const updateStore = catchAsync(async (req, res) => {
  const store = await storeService.updateStore(req.params.id, req.body);
  sendSuccess(res, store, 'Store updated successfully.');
});

const deleteStore = catchAsync(async (req, res) => {
  const result = await storeService.deleteStore(req.params.id);
  sendSuccess(res, result, 'Store deleted successfully.');
});

module.exports = { createStore, getAllStores, getStoreById, updateStore, deleteStore };
