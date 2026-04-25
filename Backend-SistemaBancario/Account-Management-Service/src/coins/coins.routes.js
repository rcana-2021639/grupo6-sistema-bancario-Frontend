import { Router } from "express";
import { createCurrency, getCurrencies, updateCurrency, deleteCurrency, getCurrencyById, changeCurrencyStatus } from "./coins.controller.js";
import { validateCoinById, validateCreateCoin, validateUpdateCoin} from "../../middlewares/coins-validators.js";

const router = Router();

router.post(
    '/create',
    validateCreateCoin,
    createCurrency
)
router.get(
    '/',
    getCurrencies
)
router.put(
    '/:id',
    validateUpdateCoin,
    updateCurrency
)

router.delete(
    '/:id',
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
    changeCurrencyStatus
)
export default router;