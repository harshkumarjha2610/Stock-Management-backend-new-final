const AppError = require('../utils/AppError');

/**
 * Factory function that returns middleware to validate req.body against a Joi schema.
 * Usage: validate(createProductSchema)
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,    // Return all errors, not just the first
      stripUnknown: true,   // Remove unknown fields
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join('. ');
      return next(new AppError(messages, 400));
    }

    req.body = value; // Replace body with validated & sanitized data
    next();
  };
};

module.exports = validate;
