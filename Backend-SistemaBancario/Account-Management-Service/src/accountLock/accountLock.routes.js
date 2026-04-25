import { Router } from 'express';
import { createAccountLock, getAccountLocks, getAccountLockById, updateAccountLock, deleteAccountLock } from './accountLock.controller.js';
import { validateCreateAccountLock, validateUpdateAccountLock, validateAccountLockById } from '../../middlewares/accountLock-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.post(
    '/create',
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
    validateUpdateAccountLock,
    updateAccountLock
);
router.delete(
    '/:id',
    validateAccountLockById,
    deleteAccountLock
);

export default router;
