const router = require('express').Router();

const ctrl = require('../controllers/product.controller');

const {
    authenticateUser,
    authorizeRoles,
    storeAccessGuard,
} = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate.middleware');

const {
    createProductSchema,
    updateProductSchema,
} = require('../validations/product.validation');

const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

// =======================
// Product Routes
// =======================

router.post(
    '/',
    validate(createProductSchema),
    ctrl.createProduct
);

router.get('/', ctrl.getProducts);

// NEW ROUTE
router.get('/dropdown-values', ctrl.getDropdownValues);

router.get('/:id', ctrl.getProductById);

router.put(
    '/:id',
    validate(updateProductSchema),
    ctrl.updateProduct
);

router.delete('/:id', ctrl.deleteProduct);

module.exports = router;