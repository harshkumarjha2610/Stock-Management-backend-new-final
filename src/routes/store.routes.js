const router = require('express').Router();
const { createStore, getAllStores, getStoreById, updateStore, deleteStore } = require('../controllers/store.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createStoreSchema, updateStoreSchema } = require('../validations/store.validation');
const ROLES = require('../constants/roles');

// All store routes require authentication
router.use(authenticateUser);

// Create and Delete are strictly Super Admin only
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN), validate(createStoreSchema), createStore);
router.delete('/:id', authorizeRoles(ROLES.SUPER_ADMIN), deleteStore);

// Get and Update can be accessed by Admin too
router.get('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), getAllStores);
router.get('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), storeAccessGuard, getStoreById);
router.put('/:id', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), storeAccessGuard, validate(updateStoreSchema), updateStore);

module.exports = router;
