const { Bill, BillItem, Product, Customer, Staff, Attendance } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const AppError = require('../utils/AppError');

/**
 * Sales report: total sales aggregated by date range.
 */
const getSalesReport = async (storeId, query) => {
  const where = { store_id: storeId };
  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }

  const result = await Bill.findAll({
    where,
    attributes: [
      [fn('DATE', col('Bill.created_at')), 'date'],
      [fn('COUNT', col('Bill.id')), 'total_bills'],
      [fn('SUM', literal("CASE WHEN type = 'SALE' THEN total_amount ELSE -total_amount END")), 'total_sales'],
      [fn('SUM', literal("CASE WHEN type = 'SALE' THEN gst_amount ELSE -gst_amount END")), 'total_gst'],
      [fn('SUM', literal("CASE WHEN type = 'SALE' THEN discount ELSE -discount END")), 'total_discount'],
      [fn('SUM', literal("CASE WHEN type = 'SALE' THEN final_amount ELSE -final_amount END")), 'total_final'],
    ],
    group: [fn('DATE', col('Bill.created_at'))],
    order: [[fn('DATE', col('Bill.created_at')), 'DESC']],
    raw: true,
  });

  return result;
};

/**
 * Profit report: (selling_price - purchase_price) × quantity for each billed item.
 */
const getProfitReport = async (storeId, query) => {
  const billWhere = { store_id: storeId };
  if (query.from || query.to) {
    billWhere.created_at = {};
    if (query.from) billWhere.created_at[Op.gte] = new Date(query.from);
    if (query.to) billWhere.created_at[Op.lte] = new Date(query.to);
  }

  const bills = await Bill.findAll({
    where: billWhere,
    include: [{
      association: 'items',
      include: [{ association: 'product', attributes: ['id', 'name', 'buying_price', 'selling_price'] }],
    }],
  });

  let totalRevenue = 0;
  let totalCost = 0;
  const productProfits = {};
  const monthlyProfits = {};

  for (const bill of bills) {
    const billDateValue = bill.created_at || bill.createdAt;
    if (!billDateValue) continue;
    
    const dateObj = new Date(billDateValue);
    if (isNaN(dateObj.getTime())) continue;

    const monthKey = dateObj.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyProfits[monthKey]) {
      monthlyProfits[monthKey] = {
        month: monthKey,
        monthDisplay: dateObj.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        revenue: 0, cost: 0, profit: 0
      };
    }

    for (const item of bill.items) {
      const sellPrice = parseFloat(item.price);
      // Use historical purchase price if available, otherwise fallback to current
      const purchasePrice = parseFloat(item.purchase_price) || (item.product ? parseFloat(item.product.buying_price) : 0);
      const qty = item.quantity;
      const factor = (bill.type === 'RETURN') ? -1 : 1;
      const revenue = (sellPrice * qty) * factor;
      const cost = (purchasePrice * qty) * factor;
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;
      
      monthlyProfits[monthKey].revenue += revenue;
      monthlyProfits[monthKey].cost += cost;
      monthlyProfits[monthKey].profit += profit;

      if (!productProfits[item.product_id]) {
        productProfits[item.product_id] = {
          product_id: item.product_id,
          product_name: item.product ? item.product.name : 'Unknown Product',
          total_quantity: 0,
          total_revenue: 0,
          total_cost: 0,
          total_profit: 0,
        };
      }
      productProfits[item.product_id].total_quantity += qty;
      productProfits[item.product_id].total_revenue += revenue;
      productProfits[item.product_id].total_cost += cost;
      productProfits[item.product_id].total_profit += profit;
    }
  }

  return {
    summary: {
      total_revenue: Math.round(totalRevenue * 100) / 100,
      total_cost: Math.round(totalCost * 100) / 100,
      total_profit: Math.round((totalRevenue - totalCost) * 100) / 100,
    },
    by_product: Object.values(productProfits),
    by_month: Object.values(monthlyProfits),
  };
};

/**
 * GST report: total GST collected by month.
 */
const getGSTReport = async (storeId, query) => {
  const where = { store_id: storeId };
  if (query.from || query.to) {
    where.created_at = {};
    if (query.from) where.created_at[Op.gte] = new Date(query.from);
    if (query.to) where.created_at[Op.lte] = new Date(query.to);
  }

  const bills = await Bill.findAll({
    where,
    include: [{ association: 'items' }],
    order: [['created_at', 'DESC']],
  });

  const report = {};

  for (const bill of bills) {
    const month = new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!report[month]) {
      report[month] = { month, total: 0, taxable: 0, gst5: 0, gst12: 0, gst18: 0, gst28: 0 };
    }

    const factor = (bill.type === 'RETURN') ? -1 : 1;
    report[month].total += parseFloat(bill.gst_amount) * factor;
    report[month].taxable += (parseFloat(bill.final_amount) - parseFloat(bill.gst_amount)) * factor;

    for (const item of bill.items) {
      const gst = parseFloat(item.gst_amount);
      const pct = parseFloat(item.gst_percent);
      if (pct <= 5) report[month].gst5 += gst * factor;
      else if (pct <= 12) report[month].gst12 += gst * factor;
      else if (pct <= 18) report[month].gst18 += gst * factor;
      else report[month].gst28 += gst * factor;
    }
  }

  return Object.values(report);
};

/**
 * Dashboard statistics: today's sales, profit, products, low stock, customers, bills, staff.
 */
const getDashboardStats = async (storeId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [
    billsToday,
    totalProducts,
    lowStockCount,
    totalCustomers,
    totalBills,
    staffPresent,
    thisMonthSales,
    lastMonthSales,
    allRevenueAndProfit
  ] = await Promise.all([
    Bill.findAll({
      where: { store_id: storeId, created_at: { [Op.gte]: today, [Op.lt]: tomorrow } },
      include: [{ association: 'items', include: [{ association: 'product', attributes: ['buying_price'] }] }],
    }),
    Product.count({ where: { store_id: storeId } }),
    Product.count({
      where: { store_id: storeId, stock_quantity: { [Op.lte]: col('min_stock_level') } },
    }),
    Customer.count({ where: { store_id: storeId } }),
    Bill.count({ where: { store_id: storeId } }),
    Attendance.count({ where: { store_id: storeId, date: today.toISOString().split('T')[0] } }),
    Bill.sum('final_amount', { where: { store_id: storeId, created_at: { [Op.gte]: startOfMonth } } }),
    Bill.sum('final_amount', { where: { store_id: storeId, created_at: { [Op.gte]: startOfLastMonth, [Op.lte]: endOfLastMonth } } }),
    Bill.findAll({
      where: { store_id: storeId },
      include: [{ association: 'items', attributes: ['price', 'quantity', 'purchase_price'] }],
    })
  ]);

  let todaySales = 0;
  let todayProfit = 0;
  for (const bill of billsToday) {
    const factor = (bill.type === 'RETURN') ? -1 : 1;
    todaySales += parseFloat(bill.final_amount) * factor;
    for (const item of bill.items) {
      const revenue = (parseFloat(item.price) * item.quantity) * factor;
      const purchasePrice = item.purchase_price || (item.product ? item.product.buying_price : 0);
      const cost = (parseFloat(purchasePrice) * item.quantity) * factor;
      todayProfit += (revenue - cost);
    }
  }

  // Calculate Average Margin over all time or this month
  let totalRev = 0;
  let totalProf = 0;
  for (const bill of allRevenueAndProfit) {
    const factor = (bill.type === 'RETURN') ? -1 : 1;
    for (const item of bill.items) {
      const rev = (parseFloat(item.price) * item.quantity) * factor;
      const cost = (parseFloat(item.purchase_price || 0) * item.quantity) * factor;
      totalRev += rev;
      totalProf += (rev - cost);
    }
  }
  const avgMargin = totalRev > 0 ? (totalProf / totalRev) * 100 : 0;

  const staffTotal = await Staff.count({ where: { store_id: storeId, status: 'ACTIVE' } });

  return {
    today_sales: Math.round(todaySales * 100) / 100,
    today_profit: Math.round(todayProfit * 100) / 100,
    total_products: totalProducts,
    low_stock_count: lowStockCount,
    total_customers: totalCustomers,
    total_bills: totalBills,
    staff_present: staffPresent,
    staff_total: staffTotal,
    this_month_sales: Math.round((thisMonthSales || 0) * 100) / 100,
    last_month_sales: Math.round((lastMonthSales || 0) * 100) / 100,
    avg_margin: Math.round(avgMargin * 10) / 10,
  };
};

/**
 * Daily sales & profit for the last X days.
 */
const getDailySales = async (storeId, days = 14) => {
  const dateLimit = new Date();
  dateLimit.setDate(dateLimit.getDate() - days);

  const bills = await Bill.findAll({
    where: { store_id: storeId, created_at: { [Op.gte]: dateLimit } },
    include: [{
      association: 'items',
      include: [{ association: 'product', attributes: ['buying_price'] }],
    }],
    order: [['created_at', 'ASC']],
  });

  const dailyData = {};
  for (const bill of bills) {
    const day = new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    if (!dailyData[day]) dailyData[day] = { day, sales: 0, profit: 0 };

    const factor = (bill.type === 'RETURN') ? -1 : 1;
    dailyData[day].sales += parseFloat(bill.final_amount) * factor;
    for (const item of bill.items) {
      const revenue = (parseFloat(item.price) * item.quantity) * factor;
      const purchasePrice = item.purchase_price || (item.product ? item.product.buying_price : 0);
      const cost = (parseFloat(purchasePrice) * item.quantity) * factor;
      dailyData[day].profit += (revenue - cost);
    }
  }

  return Object.values(dailyData).map(d => ({
    ...d,
    sales: Math.round(d.sales * 100) / 100,
    profit: Math.round(d.profit * 100) / 100,
  }));
};

/**
 * Monthly sales & profit for the last X months.
 */
const getMonthlySales = async (storeId, months = 6) => {
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - months);

  const bills = await Bill.findAll({
    where: { store_id: storeId, created_at: { [Op.gte]: dateLimit } },
    include: [{
      association: 'items',
      include: [{ association: 'product', attributes: ['buying_price'] }],
    }],
    order: [['created_at', 'ASC']],
  });

  const monthlyData = {};
  for (const bill of bills) {
    const month = new Date(bill.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) monthlyData[month] = { month, sales: 0, profit: 0 };

    const factor = (bill.type === 'RETURN') ? -1 : 1;
    monthlyData[month].sales += parseFloat(bill.final_amount) * factor;
    for (const item of bill.items) {
      const revenue = (parseFloat(item.price) * item.quantity) * factor;
      const purchasePrice = item.purchase_price || (item.product ? item.product.buying_price : 0);
      const cost = (parseFloat(purchasePrice) * item.quantity) * factor;
      monthlyData[month].profit += (revenue - cost);
    }
  }

  return Object.values(monthlyData).map(d => ({
    ...d,
    sales: Math.round(d.sales * 100) / 100,
    profit: Math.round(d.profit * 100) / 100,
  }));
};

/**
 * Top products by stock level.
 */
const getStockOverview = async (storeId, limit = 8) => {
  const products = await Product.findAll({
    where: { store_id: storeId },
    attributes: ['name', 'stock_quantity', 'min_stock_level'],
    order: [['stock_quantity', 'ASC']],
    limit,
  });

  return products.map(p => ({
    name: p.name,
    stock: p.stock_quantity,
    reorderAt: p.min_stock_level,
  }));
};

/**
 * Weekly staff attendance.
 */
const getAttendanceStats = async (storeId) => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 7);

  const attendance = await Attendance.findAll({
    where: { store_id: storeId, date: { [Op.gte]: weekStart } },
    attributes: ['date', [fn('COUNT', col('id')), 'count']],
    group: ['date'],
    order: [['date', 'ASC']],
    raw: true,
  });

  const staffTotal = await Staff.count({ where: { store_id: storeId, status: 'ACTIVE' } });

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const result = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dayName = days[d.getDay()];

    const found = attendance.find(a => a.date === dateStr);
    const present = found ? parseInt(found.count) : 0;

    result.push({
      day: dayName,
      present,
      absent: staffTotal - present,
    });
  }

  return result;
};

/**
 * Monthly GST collected vs paid.
 */
const getGSTSummary = async (storeId, months = 6) => {
  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.getMonth() - months);

  const bills = await Bill.findAll({
    where: { store_id: storeId, created_at: { [Op.gte]: dateLimit } },
    attributes: [
      [fn('TO_CHAR', col('Bill.created_at'), 'Mon YY'), 'month'],
      [fn('SUM', literal("CASE WHEN type = 'SALE' THEN gst_amount ELSE -gst_amount END")), 'collected'],
    ],
    group: [fn('TO_CHAR', col('Bill.created_at'), 'Mon YY')],
    order: [[fn('TO_CHAR', col('Bill.created_at'), 'Mon YY'), 'DESC']],
    raw: true,
  });

  const yearToDateCollected = await Bill.sum('gst_amount', {
    where: { store_id: storeId, created_at: { [Op.gte]: new Date(new Date().getFullYear(), 0, 1) } }
  });

  return {
    history: bills.map(b => ({
      month: b.month,
      collected: Math.round(parseFloat(b.collected) * 100) / 100,
      paid: Math.round(parseFloat(b.collected) * 0.35 * 100) / 100, // Estimated 35% paid
    })),
    ytd_collected: Math.round((yearToDateCollected || 0) * 100) / 100,
  };
};

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
