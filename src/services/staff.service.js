const { Staff, Attendance, User } = require('../models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const AppError = require('../utils/AppError');
const userService = require('./user.service');
const ROLES = require('../constants/roles');

const createStaff = async (data, storeId, creatorRole) => {
  // 1. Create User account for staff if email is provided
  let userId = null;
  console.log('DEBUG: createStaff received data:', data);
  if (!data.email_id || !data.password) {
    throw new AppError('Email ID and Password are required for staff creation.', 400);
  }
  const user = await userService.createUser({
    name: data.name,
    email: data.email_id,
    phone: data.phone,
    password: data.password,
    role: ROLES.STAFF,
    store_id: storeId,
  }, creatorRole);
  userId = user.id;

  const staff = await Staff.create({
    name: data.name,
    phone: data.phone,
    address: data.address,
    aadhar_card: data.aadhar_card,
    email_id: data.email_id,
    photo_url: data.photo_url,
    joining_date: data.joining_date,
    base_salary: data.base_salary,
    status: data.status ? data.status.toUpperCase() : 'ACTIVE',
    store_id: storeId,
    user_id: userId,
    plain_password: data.password,
  });
  return staff;
};

const getStaff = async (storeId) => {
  return Staff.findAll({ where: { store_id: storeId }, order: [['created_at', 'DESC']] });
};

const getStaffById = async (id, storeId) => {
  const staff = await Staff.findOne({ where: { id, store_id: storeId } });
  if (!staff) throw new AppError('Staff member not found.', 404);
  return staff;
};

const getStaffByUserId = async (userId, storeId) => {
  const staff = await Staff.findOne({ where: { user_id: userId, store_id: storeId } });
  if (!staff) throw new AppError('Staff profile not found.', 404);
  return staff;
};

// const updateStaff = async (id, data, storeId) => {
//   const staff = await getStaffById(id, storeId);
//   await staff.update({
//     name: data.name,
//     phone: data.phone,
//     address: data.address,
//     aadhar_card: data.aadhar_card,
//     email_id: data.email_id,
//     photo_url: data.photo_url,
//     joining_date: data.joining_date,
//     base_salary: data.base_salary,
//     status: data.status ? data.status.toUpperCase() : staff.status,
//   });
//   return staff;
// };
const updateStaff = async (id, data, storeId) => {
  const staff = await getStaffById(id, storeId);

  // Check if another staff already uses the same email
  if (
    data.email_id &&
    data.email_id !== staff.email_id
  ) {
    const existingStaff = await Staff.findOne({
      where: {
        email_id: data.email_id,
        store_id: storeId,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingStaff) {
      throw new AppError(
        "Another staff member already uses this email.",
        409
      );
    }
  }

  // Update linked User account
  if (staff.user_id) {
    const user = await User.findByPk(staff.user_id);

    if (user) {
      if (data.name !== undefined) {
        user.name = data.name;
      }

      if (data.phone !== undefined) {
        user.phone = data.phone;
      }

      if (data.email_id !== undefined) {
        user.email = data.email_id;
      }

      // Change password only if a new one is entered
      if (
        data.password &&
        data.password.trim() !== ""
      ) {
        user.password_hash = data.password;
        // Also update the plain_password on the staff record
        await staff.update({ plain_password: data.password });
      }

      await user.save();
    }
  }

  await staff.update({
    name: data.name,
    phone: data.phone,
    address: data.address,
    aadhar_card: data.aadhar_card,
    email_id: data.email_id,
    photo_url: data.photo_url,
    joining_date: data.joining_date,
    base_salary: data.base_salary,
    status: data.status
      ? data.status.toUpperCase()
      : staff.status,
  });

  return staff.reload();
};

const deleteStaff = async (id, storeId) => {
  const staff = await getStaffById(id, storeId);
  await staff.destroy();
  return { id };
};

const resolveStaffId = async (staffId, storeId) => {
  try {
    await getStaffById(staffId, storeId);
    return staffId;
  } catch (err) {
    const staff = await getStaffByUserId(staffId, storeId);
    return staff.id;
  }
};

/**
 * Check-in: create attendance record with current time.
 */
const checkIn = async (staffId, storeId) => {
  const resolvedStaffId = await resolveStaffId(staffId, storeId);
  const staff = await getStaffById(resolvedStaffId, storeId);
  const today = dayjs().format('YYYY-MM-DD');

  // Check if already checked in today
  const existing = await Attendance.findOne({
    where: { staff_id: resolvedStaffId, store_id: storeId, date: today },
  });

  if (existing && existing.check_in && !existing.check_out) {
    throw new AppError('Already checked in. Please check out first.', 400);
  }

  if (existing && existing.check_out) {
    throw new AppError('Already checked in and out for today.', 400);
  }

  const attendance = await Attendance.create({
    staff_id: resolvedStaffId,
    store_id: storeId,
    date: today,
    check_in: new Date(),
  });

  return attendance;
};

/**
 * Check-out: update attendance record and calculate working hours.
 */
const checkOut = async (staffId, storeId) => {
  const today = dayjs().format('YYYY-MM-DD');

  const resolvedStaffId = await resolveStaffId(staffId, storeId);
  const attendance = await Attendance.findOne({
    where: { staff_id: resolvedStaffId, store_id: storeId, date: today, check_out: null },
  });

  if (!attendance) {
    throw new AppError('No active check-in found for today.', 400);
  }

  const checkOutTime = new Date();
  const checkInTime = new Date(attendance.check_in);
  const diffMs = checkOutTime - checkInTime;
  const workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

  const status = workingHours < 6 ? 'HALF_DAY' : 'PRESENT';

  await attendance.update({
    check_out: checkOutTime,
    working_hours: workingHours,
    status,
  });

  return attendance;
};

/**
 * Get attendance records for a staff member.
 */
const getAttendance = async (staffId, storeId, query = {}) => {
  const where = { staff_id: staffId, store_id: storeId };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }
  return Attendance.findAll({ where, order: [['date', 'DESC']] });
};

/**
 * Get all attendance records for a store.
 */
const getAllAttendance = async (storeId, query = {}) => {
  const where = { store_id: storeId };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date[Op.gte] = query.from;
    if (query.to) where.date[Op.lte] = query.to;
  }
  return Attendance.findAll({
    where,
    include: [{ association: 'staff', attributes: ['name'] }],
    order: [['date', 'DESC']]
  });
};

/**
 * Mark Attendance (Admin Action)
 */
const markAttendance = async (data, storeId) => {
  const { staff_id, date, status } = data;

  // Check if record exists for this date
  const existing = await Attendance.findOne({
    where: { staff_id, date, store_id: storeId }
  });

  if (existing) {
    await existing.update({ status: status.toUpperCase() });
    return existing;
  }

  const attendance = await Attendance.create({
    staff_id,
    store_id: storeId,
    date,
    status: status.toUpperCase()
  });

  return attendance;
};

module.exports = { createStaff, getStaff, getStaffById, getStaffByUserId, updateStaff, deleteStaff, checkIn, checkOut, getAttendance, getAllAttendance, markAttendance };
