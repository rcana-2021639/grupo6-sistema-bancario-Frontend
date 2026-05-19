import { Router } from "express";
import { createCard, getCards, getMyCards, updateCard, deleteCard, getCardById, getCardMovements, consumeCard, changeCardStatus, changeCardPin, setCardLimit } from "./cards.controller.js";
import { validateCreateCard, validateUpdateCard, validateCardById, validateReadCardById, validateChangeCardStatus, validateChangeCardPin, validateSetCardLimit, validateConsumeCard } from "../../middlewares/card-validators.js";
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
router.post(
    '/:id/consume',
    validateConsumeCard,
    consumeCard
)
router.patch(
    '/:id/status',
    validateChangeCardStatus,
    changeCardStatus
)
router.patch(
    '/:id/pin',
    validateChangeCardPin,
    changeCardPin
)
router.patch(
    '/:id/limit',
    validateSetCardLimit,
    setCardLimit
)
export default router;
