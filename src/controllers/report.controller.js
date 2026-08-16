const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const reportService = require('../services/report.service');

const getSalesReport = catchAsync(async (req, res) => {
  const result = await reportService.getSalesReport(req.storeId, req.query);
  sendSuccess(res, result, 'Sales report retrieved.');
});

const getProfitReport = catchAsync(async (req, res) => {
  const result = await reportService.getProfitReport(req.storeId, req.query);
  sendSuccess(res, result, 'Profit report retrieved.');
});

const getGSTReport = catchAsync(async (req, res) => {
  const result = await reportService.getGSTReport(req.storeId, req.query);
  sendSuccess(res, result, 'GST report retrieved.');
});

const getDashboardStats = catchAsync(async (req, res) => {
  const result = await reportService.getDashboardStats(req.storeId);
  sendSuccess(res, result, 'Dashboard stats retrieved.');
});

const getDailySales = catchAsync(async (req, res) => {
  const result = await reportService.getDailySales(req.storeId, req.query.days);
  sendSuccess(res, result, 'Daily sales retrieved.');
});

const getMonthlySales = catchAsync(async (req, res) => {
  const result = await reportService.getMonthlySales(req.storeId, req.query.months);
  sendSuccess(res, result, 'Monthly sales retrieved.');
});

const getStockOverview = catchAsync(async (req, res) => {
  const result = await reportService.getStockOverview(req.storeId, req.query.limit);
  sendSuccess(res, result, 'Stock overview retrieved.');
});

const getAttendanceStats = catchAsync(async (req, res) => {
  const result = await reportService.getAttendanceStats(req.storeId);
  sendSuccess(res, result, 'Attendance stats retrieved.');
});

const getGSTSummary = catchAsync(async (req, res) => {
  const result = await reportService.getGSTSummary(req.storeId, req.query.months);
  sendSuccess(res, result, 'GST summary retrieved.');
});

module.exports = {
  getSalesReport,
  getProfitReport,
  getGSTReport,
  getDashboardStats,
  getDailySales,
  getMonthlySales,
  getStockOverview,
  getAttendanceStats,
  getGSTSummary
};
