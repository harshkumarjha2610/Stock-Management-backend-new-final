const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const AppError = require('../utils/AppError');
const staffService = require('../services/staff.service');
const ROLES = require('../constants/roles');

const ensureSelfOrAdmin = async (req, staffId) => {
  if (req.user.role === ROLES.STAFF) {
    const staff = await staffService.getStaffByUserId(req.user.id, req.storeId);
    if (
      staff.id.toString() !== staffId.toString() &&
      req.user.id.toString() !== staffId.toString()
    ) {
      throw new AppError('You are not authorized to perform this action.', 403);
    }
  }
};

const createStaff = catchAsync(async (req, res) => {
  const staff = await staffService.createStaff(req.body, req.storeId, req.user.role);
  sendSuccess(res, staff, 'Staff member created.', 201);
});

const getStaff = catchAsync(async (req, res) => {
  const staff = await staffService.getStaff(req.storeId);
  sendSuccess(res, staff, 'Staff list retrieved.');
});

const getStaffMe = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffByUserId(req.user.id, req.storeId);
  sendSuccess(res, staff, 'Your staff profile retrieved.');
});

const getStaffById = catchAsync(async (req, res) => {
  const staff = await staffService.getStaffById(req.params.id, req.storeId);
  sendSuccess(res, staff, 'Staff member retrieved.');
});

const checkIn = catchAsync(async (req, res) => {
  await ensureSelfOrAdmin(req, req.params.id);
  const attendance = await staffService.checkIn(req.params.id, req.storeId);
  sendSuccess(res, attendance, 'Checked in successfully.', 201);
});

const checkOut = catchAsync(async (req, res) => {
  await ensureSelfOrAdmin(req, req.params.id);
  const attendance = await staffService.checkOut(req.params.id, req.storeId);
  sendSuccess(res, attendance, 'Checked out successfully.');
});

const getAttendance = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { role, id: userId } = req.user;

  // Security: Staff can only see their own attendance
  if (role === 'STAFF') {
    const staff = await staffService.getStaffByUserId(userId, req.storeId);
    if (staff.id.toString() !== id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this attendance.' });
    }
  }

  const records = await staffService.getAttendance(id, req.storeId, req.query);
  sendSuccess(res, records, 'Attendance records retrieved.');
});

const getAllAttendance = catchAsync(async (req, res) => {
  const records = await staffService.getAllAttendance(req.storeId, req.query);
  sendSuccess(res, records, 'All attendance records retrieved.');
});

const updateStaff = catchAsync(async (req, res) => {
  const staff = await staffService.updateStaff(req.params.id, req.body, req.storeId);
  sendSuccess(res, staff, 'Staff member updated successfully.');
});

const deleteStaff = catchAsync(async (req, res) => {
  const result = await staffService.deleteStaff(req.params.id, req.storeId);
  sendSuccess(res, result, 'Staff member deleted successfully.');
});

const markAttendance = catchAsync(async (req, res) => {
  const attendance = await staffService.markAttendance(req.body, req.storeId);
  sendSuccess(res, attendance, 'Attendance marked successfully.');
});

module.exports = { createStaff, getStaff, getStaffMe, getStaffById, updateStaff, deleteStaff, checkIn, checkOut, getAttendance, getAllAttendance, markAttendance };
