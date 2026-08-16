const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/AppError');
const ROLES = require('../constants/roles');

/**
 * Verifies JWT token from Authorization header and attaches user payload to req.user.
 */
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authentication required. Please provide a valid token.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.jwt.secret);
    req.user = decoded; // { id, store_id, role }
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

/**
 * Factory function that returns middleware restricting access to specified roles.
 */
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }
    next();
  };
};

/**
 * Ensures non-super-admin users can only access data within their own store.
 * Attaches the effective store_id to req.storeId for use in services.
 */
const storeAccessGuard = (req, res, next) => {
  const user = req.user;
  if (!user) {
    return next(new AppError('Authentication required.', 401));
  }

  // 1. Determine the store ID from various potential sources
  const storeIdFromContext = 
    req.headers['x-store-id'] || 
    req.params.storeId || 
    req.params.id || 
    req.body.store_id || 
    req.query.store_id;

  // 2. Handle Super Admin
  if (user.role === 'SUPER_ADMIN') {
    // Super Admin can use the provided context or fallback to their assigned store (usually null)
    req.storeId = storeIdFromContext || user.store_id;
    // Super Admin is never blocked by "Store context required"
    return next();
  }

  // 3. Handle Admin and Staff
  // They are strictly limited to their assigned store
  req.storeId = user.store_id;

  // If they tried to specify a different store, block them
  if (storeIdFromContext && String(storeIdFromContext) !== String(user.store_id)) {
    return next(new AppError('You do not have permission to access records for this store.', 403));
  }

  // If no store_id is found in user record, they can't do anything that requires store context
  if (!req.storeId) {
    return next(new AppError('Store context is required. Please ensure your user is assigned to a store.', 400));
  }

  next();
};

module.exports = { authenticateUser, authorizeRoles, storeAccessGuard };
