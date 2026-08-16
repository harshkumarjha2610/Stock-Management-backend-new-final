const router = require('express').Router();
const ctrl = require('../controllers/billing.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createBillSchema } = require('../validations/billing.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN, ROLES.STAFF));
router.use(storeAccessGuard);

router.post('/', validate(createBillSchema), ctrl.createBill);
router.get('/', ctrl.getBills);
router.get('/:id', ctrl.getBillById);

module.exports = router;
