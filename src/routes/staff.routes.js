const router = require('express').Router();
const ctrl = require('../controllers/staff.controller');
const {
    authenticateUser,
    authorizeRoles,
    storeAccessGuard,
} = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const {
    createStaffSchema,
    updateStaffSchema,
} = require('../validations/staff.validation');
const ROLES = require('../constants/roles');

router.use(authenticateUser);
router.use(storeAccessGuard);

// Staff CRUD
router.post(
    '/',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    validate(createStaffSchema),
    ctrl.createStaff
);

router.get(
    '/',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ctrl.getStaff
);

router.get('/me', ctrl.getStaffMe);

// Attendance
router.get(
    '/attendance',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ctrl.getAllAttendance
);

router.post(
    '/attendance',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ctrl.markAttendance
);

// Staff by ID
router.get(
    '/:id',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ctrl.getStaffById
);

router.put(
    '/:id',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    validate(updateStaffSchema),
    ctrl.updateStaff
);

router.delete(
    '/:id',
    authorizeRoles(ROLES.SUPER_ADMIN, ROLES.ADMIN),
    ctrl.deleteStaff
);

// Check In / Check Out
router.post(
    '/:id/check-in',
    authorizeRoles(
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.STAFF
    ),
    ctrl.checkIn
);

router.post(
    '/:id/check-out',
    authorizeRoles(
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.STAFF
    ),
    ctrl.checkOut
);

// Staff Attendance
router.get(
    '/:id/attendance',
    authorizeRoles(
        ROLES.SUPER_ADMIN,
        ROLES.ADMIN,
        ROLES.STAFF
    ),
    ctrl.getAttendance
);

module.exports = router;