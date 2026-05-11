import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

export const validateCreateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    body('name').notEmpty().withMessage('El nombre es requerido').isLength({ max: 80 }),
    body('price').notEmpty().withMessage('El precio es requerido').isFloat({ min: 0.01 }),
    body('currencyCode').optional().isLength({ min: 3, max: 3 }).isAlpha(),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['activo', 'inactivo']),
    checkValidators
];

export const validateUpdateProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id').notEmpty().withMessage('El ID es requerido'),
    body('name').notEmpty().withMessage('El nombre es requerido').isLength({ max: 80 }),
    body('price').notEmpty().withMessage('El precio es requerido').isFloat({ min: 0.01 }),
    body('currencyCode').optional().isLength({ min: 3, max: 3 }).isAlpha(),
    body('stock').optional().isInt({ min: 0 }),
    body('status').optional().isIn(['activo', 'inactivo']),
    checkValidators
];

export const validateProductId = [
    validateJWT,
    param('id').notEmpty().withMessage('El ID es requerido'),
    checkValidators
];

export const validatePurchaseProduct = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('id').notEmpty().withMessage('El ID es requerido'),
    body('accountNumber')
        .notEmpty()
        .withMessage('El numero de cuenta es requerido')
        .matches(/^[A-Z]{3}-\d{3}-\d{4}$/)
        .withMessage('El numero de cuenta debe tener formato ABC-000-0000'),
    body('quantity').optional().isInt({ min: 1 }).withMessage('La cantidad debe ser al menos 1'),
    checkValidators
];
