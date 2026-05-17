import { Router } from 'express';
import {
    createAccountStatement,
    getAccountStatements,
    updateAccountStatement,
    deleteAccountStatement,
    getAccountStatementById,
    downloadAccountStatementPdfByAccountNumber,
} from './accountStatements.controller.js';
import {
    validateCreateAccountStatement,
    validateUpdateAccountStatement,
    validateAccountStatementById,
    validateAccountStatementByAccountNumber,
} from '../../middlewares/accountStatement-validators.js';

import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.post(
    '/create',
    validateCreateAccountStatement,
    createAccountStatement,
);

router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    getAccountStatements,
);


router.get(
    '/account/:accountNumber/pdf',
    validateAccountStatementByAccountNumber,
    downloadAccountStatementPdfByAccountNumber,
);

router.put(
    '/:id',
    validateUpdateAccountStatement,
    updateAccountStatement,
);

router.delete(
    '/:id',
    validateAccountStatementById,
    deleteAccountStatement,
);

router.get(
    '/:id',
    validateAccountStatementById,
    getAccountStatementById,
);
export default router;
