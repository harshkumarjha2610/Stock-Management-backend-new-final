const router = require('express').Router();
const { login } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { loginSchema } = require('../validations/auth.validation');

router.post('/login', validate(loginSchema), login);

module.exports = router;
