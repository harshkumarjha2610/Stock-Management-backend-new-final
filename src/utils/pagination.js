/**
 * Parses pagination query parameters and returns Sequelize-compatible
 * offset/limit values along with metadata for the response.
 */
const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const offset = (page - 1) * limit;

  return { page, limit, offset };
};

/**
 * Builds a paginated response object from Sequelize findAndCountAll results.
 */
const paginatedResponse = (rows, count, page, limit) => {
  return {
    items: rows,
    pagination: {
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    },
  };
};

module.exports = { parsePagination, paginatedResponse };
