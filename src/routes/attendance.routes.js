const router = require('express').Router();
const ctrl = require('../controllers/staff.controller');
const { authenticateUser, authorizeRoles, storeAccessGuard } = require('../middlewares/auth.middleware');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN));
router.use(storeAccessGuard);

router.get('/', ctrl.getAllAttendance);
router.get('/all', ctrl.getAllAttendance);
router.post('/mark', ctrl.markAttendance);

module.exports = router;
