const router = require('express').Router();
const ctrl = require('../controllers/customer.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCustomerSchema } = require('../validations/customer.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.post('/', validate(createCustomerSchema), ctrl.createCustomer);
router.get('/', ctrl.getCustomers);
router.get('/:id', ctrl.getCustomerById);
router.put('/:id', ctrl.updateCustomer);
router.delete('/:id', ctrl.deleteCustomer);
router.get('/:id/purchases', ctrl.getPurchaseHistory);

module.exports = router;
