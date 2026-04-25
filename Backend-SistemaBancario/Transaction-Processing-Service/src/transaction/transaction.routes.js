import { Router } from "express";
import { createTransaction, getTransactions, getFavorites, updateTransaction, deleteTransaction, getTransactionById } from "./transaction.controller.js";
import { validateCreateTransaction, validateUpdateTransaction, validateTransactionById } from "../../middlewares/transaction-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { requireRole } from "../../middlewares/validate-role.js";

const router = Router();

router.post(
    '/create',
    validateJWT,
    validateCreateTransaction,
    createTransaction
)
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    getTransactions
)
router.get(
    '/favorites',
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    getFavorites
)
router.put(
    '/:id',
    validateJWT,
    validateUpdateTransaction,
    updateTransaction
)
router.delete(
    '/:id',
    validateJWT,
    validateTransactionById,
    deleteTransaction
)
router.get(
    '/:id',
    validateJWT,
    validateTransactionById,
    getTransactionById
)
export default router;
