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

const router = Router();

router.post(
    '/create',
    validateCreateAccountStatement,
    createAccountStatement,
);

router.get(
    '/',
    getAccountStatements,
);


router.get(
    '/account/:accountNumber/pdf',
    validateJWT,                      
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

router.put(
    '/:id',
    updateAccountStatement
)

router.delete(
    '/:id',
    deleteAccountStatement
)

router.get(
    '/:id', 
    getAccountStatementById
)
export default router;