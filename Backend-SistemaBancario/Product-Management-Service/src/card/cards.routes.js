import { Router } from "express";
import { createCard, getCards, updateCard, deleteCard, getCardById, changeCardStatus } from "./cards.controller.js";
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
router.patch(
    '/:id/status',
    changeCardStatus
)
export default router;
