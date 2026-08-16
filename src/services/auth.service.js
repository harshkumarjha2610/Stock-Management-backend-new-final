const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');
const AppError = require('../utils/AppError');

/**
 * Authenticate user by email and password, return JWT token.
 */
const login = async (email, password) => {
  // Find user by email (include password_hash for comparison)
  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  if (user.status === 'INACTIVE') {
    throw new AppError('Your account has been deactivated. Contact your administrator.', 403);
  }

  // Compare password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password.', 401);
  }

  // Generate JWT token
  const token = generateToken(user);

  return {
    token,
    user: user.toJSON(),
  };
};

/**
 * Generate JWT token with user payload.
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      store_id: user.store_id,
      role: user.role,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

module.exports = { login, generateToken };
