const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/stores', require('./store.routes'));
router.use('/users', require('./user.routes'));
router.use('/products', require('./product.routes'));
router.use('/stock', require('./stock.routes'));
router.use('/billing', require('./billing.routes'));
router.use('/bills', require('./billing.routes')); // Alias
router.use('/reports', require('./report.routes'));
router.use('/customers', require('./customer.routes'));
router.use('/staff', require('./staff.routes'));
router.use('/salary', require('./salary.routes'));
router.use('/salaries', require('./salary.routes')); // Alias
router.use('/attendance', require('./attendance.routes'));
router.use('/stock-history', require('./stock-history.routes'));
router.use('/discounts', require('./discount.routes'));

module.exports = router;
