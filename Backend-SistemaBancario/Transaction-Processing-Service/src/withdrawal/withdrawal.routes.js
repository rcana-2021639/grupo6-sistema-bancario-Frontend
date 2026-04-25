import { Router } from 'express';
import { createWithdrawal, getAccountStatement } from './withdrawal.controller.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { withdrawalValidators } from '../../middlewares/withdrawal-validators.js';

const router = Router();

//ruta que realiza el retiro
router.post(
    '/', 
    [
        validateJWT, 
        withdrawalValidators // Verifica montos positivos y formato ACC-
    ], 
    createWithdrawal
);

//la ruta que mira el estado de cuenta
//El ":id" debe ser el número de cuenta (ej. ACC-830-001)

router.get(
    '/statement/:id', 
    [
        validateJWT
    ], 
    getAccountStatement
);

export default router;