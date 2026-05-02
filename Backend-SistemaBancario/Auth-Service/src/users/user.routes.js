import { Router } from 'express';
import {
    changeRole,
    createAdministrativeUser,
    deleteUser,
    changeUserStatus,
    updateUser,
    updateUserRole,
    getUserRoles,
    getUsersByRole
} from './user.controller.js';

const router = Router();

// POST /api/v1/users/administrative
router.post('/administrative', ...createAdministrativeUser);

// PUT /api/v1/users/:userId
router.put('/:userId', ...updateUser);

// PUT /api/v1/users/:userId/status
router.put('/:userId/status', ...changeUserStatus);

// DELETE /api/v1/users/:userId
router.delete('/:userId', ...deleteUser);

// PUT /api/v1/users/:userId/role
router.put('/:userId/role', ...updateUserRole);

// PUT /api/v1/users/change-role/:userId
router.put('/change-role/:userId', ...changeRole);

// GET /api/v1/users/:userId/roles
router.get('/:userId/roles', ...getUserRoles);

// GET /api/v1/users/by-role/:roleName
router.get('/by-role/:roleName', ...getUsersByRole);

export default router;
