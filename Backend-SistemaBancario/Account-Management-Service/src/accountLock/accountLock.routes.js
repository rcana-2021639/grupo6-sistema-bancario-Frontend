import { Router } from 'express';
import { createAccountLock, getAccountLocks, getAccountLockById, updateAccountLock, deleteAccountLock } from './accountLock.controller.js';
import { validateCreateAccountLock, validateUpdateAccountLock, validateAccountLockById } from '../../middlewares/accountLock-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    validateCreateAccountLock,
    createAccountLock
);
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    getAccountLocks
);
router.get(
    '/:id',
    validateJWT,
    validateAccountLockById,
    getAccountLockById
);
router.put(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    validateUpdateAccountLock,
    updateAccountLock
);
router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    validateAccountLockById,
    deleteAccountLock
);

export default router;
