const router = require('express').Router();
const ctrl = require('../controllers/salary.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createSalaryPaymentSchema } = require('../validations/salary.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(storeAccessGuard);

router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.getAllSalaries);
router.get('/staff/:staffId', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), ctrl.getSalaryHistory);
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN), validate(createSalaryPaymentSchema), ctrl.createSalaryPayment);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN), validate(require('../validations/salary.validation').updateSalaryPaymentSchema), ctrl.updateSalaryPayment);

module.exports = router;
