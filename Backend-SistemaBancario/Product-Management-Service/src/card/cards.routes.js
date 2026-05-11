import { Router } from "express";
import { createCard, getCards, getMyCards, updateCard, deleteCard, getCardById, getCardMovements, changeCardStatus } from "./cards.controller.js";
import { validateCreateCard, validateUpdateCard, validateCardById, validateReadCardById } from "../../middlewares/card-validators.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";
import { requireRole } from "../../middlewares/validate-role.js";
const router = Router();

router.post(
    '/create',
    validateCreateCard,
    createCard
)
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE'),
    getCards
)
router.get(
    '/my',
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    getMyCards
)
router.put(
    '/:id',
    validateUpdateCard,
    updateCard
)
router.delete(
    '/:id',
    validateCardById,
    deleteCard
)
router.get(
    '/:id',
    validateReadCardById,
    getCardById
)
router.get(
    '/:id/movements',
    validateReadCardById,
    getCardMovements
)
router.patch(
    '/:id/status',
    changeCardStatus
)
export default router;
