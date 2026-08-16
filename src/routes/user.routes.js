const router = require('express').Router();
const { createUser, getProfile, getUsersByStore, updateActiveStore } = require('../controllers/user.controller');
const { authenticateUser, authorizeRoles } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createUserSchema } = require('../validations/auth.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);

// Get own profile — any authenticated user
router.get('/profile', getProfile);

// Update active store — any authenticated user
router.patch('/active-store', updateActiveStore);

// Create user — Super Admin or Admin
router.post('/', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), validate(createUserSchema), createUser);

// Get users by store — Super Admin or Admin
router.get('/store/:storeId', authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN), getUsersByStore);

module.exports = router;
