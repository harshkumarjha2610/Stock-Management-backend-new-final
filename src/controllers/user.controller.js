const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const userService = require('../services/user.service');

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body, req.user.role);
  sendSuccess(res, user, 'User created successfully.', 201);
});

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.user.id);
  sendSuccess(res, user, 'Profile retrieved successfully.');
});

const getUsersByStore = catchAsync(async (req, res) => {
  const storeId = req.params.storeId || req.user.store_id;
  const users = await userService.getUsersByStore(storeId);
  sendSuccess(res, users, 'Users retrieved successfully.');
});

const updateActiveStore = catchAsync(async (req, res) => {
  const { storeId } = req.body;
  if (!storeId) {
    return res.status(400).json({ success: false, message: 'storeId is required.' });
  }
  const user = await userService.updateActiveStore(req.user.id, storeId);
  sendSuccess(res, user, 'Active store updated successfully.');
});

module.exports = { createUser, getProfile, getUsersByStore, updateActiveStore };
