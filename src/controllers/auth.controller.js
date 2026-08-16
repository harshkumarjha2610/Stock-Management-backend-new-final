const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const authService = require('../services/auth.service');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  sendSuccess(res, result, 'Login successful.');
});

module.exports = { login };
