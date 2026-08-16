const router = require('express').Router();
const ctrl = require('../controllers/stock.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { stockInSchema, stockOutSchema } = require('../validations/stock.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.post('/in', validate(stockInSchema), ctrl.stockIn);
router.post('/out', validate(stockOutSchema), ctrl.stockOut);
router.get('/history', ctrl.getStockHistory);
router.get('/low-stock', ctrl.getLowStockProducts);

module.exports = router;
