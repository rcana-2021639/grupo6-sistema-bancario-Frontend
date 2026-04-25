import mongoose from 'mongoose';
import { body, param } from 'express-validator';
import { checkValidators } from './checkValidators.js';
import { validateJWT } from './validate-JWT.js';
import { requireRole } from './validate-role.js';

const ACCOUNT_NUMBER_REGEX = /^[A-Z]{3}-\d{3}-\d{4}$/;

const validateOptionalDate = (fieldName) =>
    body(fieldName)
        .optional()
        .isISO8601()
        .withMessage(`${fieldName} debe ser una fecha valida`);

const validateOptionalNonNegativeNumber = (fieldName, label) =>
    body(fieldName)
        .optional()
        .isFloat({ min: 0 })
        .withMessage(`${label} debe ser un numero mayor o igual a 0`);

export const validateCreateAccountStatement = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
    body()
        .custom((_, { req }) => {
            if (!req.body.accountId && !req.body.accountNumber) {
                throw new Error('Debes enviar accountId o accountNumber');
            }

            return true;
        }),
    body('accountId')
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('accountId invalido'),
    body('accountNumber')
        .optional()
        .matches(ACCOUNT_NUMBER_REGEX)
        .withMessage('El numero de cuenta debe tener formato ABC-000-0000'),
    body('periodStart')
        .notEmpty()
        .withMessage('La fecha de inicio es requerida')
        .isISO8601()
        .withMessage('periodStart debe ser una fecha valida'),
    body('periodEnd')
        .notEmpty()
        .withMessage('La fecha de fin es requerida')
        .isISO8601()
        .withMessage('periodEnd debe ser una fecha valida'),
    body('periodEnd')
        .custom((value, { req }) => {
            const start = new Date(req.body.periodStart);
            const end = new Date(value);

            if (start > end) {
                throw new Error('periodEnd no puede ser menor que periodStart');
            }

            return true;
        }),
    validateOptionalNonNegativeNumber('openingBalance', 'El saldo inicial'),
    validateOptionalNonNegativeNumber('closingBalance', 'El saldo final'),
    validateOptionalNonNegativeNumber('totalDeposits', 'El total de depositos'),
    validateOptionalNonNegativeNumber('totalWithdrawals', 'El total de retiros'),
    validateOptionalNonNegativeNumber('totalTransfersSent', 'El total de transferencias enviadas'),
    validateOptionalNonNegativeNumber('totalTransfersReceived', 'El total de transferencias recibidas'),
    validateOptionalNonNegativeNumber('interestEarned', 'El interes ganado'),
    validateOptionalNonNegativeNumber('feesCharged', 'Los cargos aplicados'),
    checkValidators,
];

export const validateUpdateAccountStatement = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El id es requerido')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('El id no es valido'),
    body('accountId')
        .optional()
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('accountId invalido'),
    body('accountNumber')
        .optional()
        .matches(ACCOUNT_NUMBER_REGEX)
        .withMessage('El numero de cuenta debe tener formato ABC-000-0000'),
    validateOptionalDate('periodStart'),
    validateOptionalDate('periodEnd'),
    body('periodEnd')
        .optional()
        .custom((value, { req }) => {
            if (!value || !req.body.periodStart) {
                return true;
            }

            const start = new Date(req.body.periodStart);
            const end = new Date(value);

            if (start > end) {
                throw new Error('periodEnd no puede ser menor que periodStart');
            }

            return true;
        }),
    validateOptionalNonNegativeNumber('openingBalance', 'El saldo inicial'),
    validateOptionalNonNegativeNumber('closingBalance', 'El saldo final'),
    validateOptionalNonNegativeNumber('totalDeposits', 'El total de depositos'),
    validateOptionalNonNegativeNumber('totalWithdrawals', 'El total de retiros'),
    validateOptionalNonNegativeNumber('totalTransfersSent', 'El total de transferencias enviadas'),
    validateOptionalNonNegativeNumber('totalTransfersReceived', 'El total de transferencias recibidas'),
    validateOptionalNonNegativeNumber('interestEarned', 'El interes ganado'),
    validateOptionalNonNegativeNumber('feesCharged', 'Los cargos aplicados'),
    checkValidators,
];

export const validateAccountStatementById = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
    param('id')
        .notEmpty()
        .withMessage('El id es requerido')
        .custom((value) => mongoose.Types.ObjectId.isValid(value))
        .withMessage('El id no es valido'),
    checkValidators,
];

export const validateAccountStatementByAccountNumber = [
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    param('accountNumber')
        .notEmpty()
        .withMessage('El numero de cuenta es requerido')
        .matches(ACCOUNT_NUMBER_REGEX)
        .withMessage('El numero de cuenta debe tener formato ABC-000-0000'),
    checkValidators,
];
