import { Router } from "express";
import { createLoan, getLoans, getMyLoans, getLoanById, updateLoan, deleteLoan } from "./loans.controller.js";
import { validateCreateLoan, validateUpdateLoan, validateLoanById } from "../../middlewares/loan-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { requireRole } from "../../middlewares/validate-role.js";
const router = Router();

router.post(
    '/create',
    validateCreateLoan,
    createLoan
)
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    getLoans
)
router.get(
    '/my',
    validateJWT,
    getMyLoans
)
router.get(
    '/:id',
    validateJWT,
    validateLoanById,
    getLoanById
)
router.put(
    '/:id',
    validateJWT,
    validateUpdateLoan,
    updateLoan
)
router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE','ATM_ROLE'),
    validateLoanById,
    deleteLoan
)

export default router;