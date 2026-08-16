const { Customer, Bill } = require('../models');
const AppError = require('../utils/AppError');
const { parsePagination, paginatedResponse } = require('../utils/pagination');

const createCustomer = async (data, storeId) => {
  const customer = await Customer.create({
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    status: data.status || 'active',
    tag: data.tag || 'new',
    coins: parseInt(data.coins, 10) || 0,
    store_id: storeId,
  });
  return customer;
};

const getCustomers = async (storeId, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const { rows, count } = await Customer.findAndCountAll({
    where: { store_id: storeId },
    order: [['created_at', 'DESC']],
    limit, offset,
  });
  
  if (!query.page) return rows;
  return paginatedResponse(rows, count, page, limit);
};

const getCustomerById = async (id, storeId) => {
  const customer = await Customer.findOne({ where: { id, store_id: storeId } });
  if (!customer) throw new AppError('Customer not found.', 404);
  return customer;
};

const updateCustomer = async (id, data, storeId) => {
  const customer = await getCustomerById(id, storeId);
  await customer.update({
    name: data.name,
    phone: data.phone,
    email: data.email,
    address: data.address,
    city: data.city,
    status: data.status,
    tag: data.tag,
    coins: data.coins !== undefined ? parseInt(data.coins, 10) : customer.coins,
  });
  return customer;
};

const deleteCustomer = async (id, storeId) => {
  const customer = await getCustomerById(id, storeId);
  await customer.destroy();
  return { id };
};

const getPurchaseHistory = async (customerId, storeId, query = {}) => {
  const { page, limit, offset } = parsePagination(query);
  const customer = await Customer.findOne({ where: { id: customerId, store_id: storeId } });
  if (!customer) throw new AppError('Customer not found.', 404);

  const { rows, count } = await Bill.findAndCountAll({
    where: { customer_id: customerId, store_id: storeId },
    include: [{ association: 'items', include: [{ association: 'product', attributes: ['id', 'name'] }] }],
    order: [['created_at', 'DESC']],
    limit, offset,
  });
  return paginatedResponse(rows, count, page, limit);
};

module.exports = { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer, getPurchaseHistory };
