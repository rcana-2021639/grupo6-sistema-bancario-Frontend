import { Router } from "express";
import { createCurrency, getCurrencies, updateCurrency, deleteCurrency, getCurrencyById, changeCurrencyStatus } from "./coins.controller.js";
import { validateCoinById, validateCreateCoin, validateUpdateCoin} from "../../middlewares/coins-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { requireRole } from "../../middlewares/validate-role.js";

const router = Router();

router.post(
    '/create',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE'),
    validateCreateCoin,
    createCurrency
)
router.get(
    '/',
    getCurrencies
)
router.put(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE'),
    validateUpdateCoin,
    updateCurrency
)

router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE'),
    validateCoinById,
    deleteCurrency
)

router.get(
    '/:id',
    validateCoinById,
    getCurrencyById
)
router.patch(
    '/:id/status', 
    validateJWT,
    requireRole('ADMIN_ROLE','MANAGER_ROLE'),
    changeCurrencyStatus
)
export default router;
