'use strict';

import { Router } from 'express';
import {
    createDeposit,
    getDeposits,
    getDepositById,
    updateDepositAmount,
    deleteDeposit,
    revertDeposit
} from './deposits.controller.js';
import {
    validateCreateDeposit,
    validateListDeposits,
    validateUpdateDepositAmount,
    validateDepositById,
    validateRevertDeposit
} from '../../middlewares/deposits-validators.js';

const router = Router();

router.post('/create', validateCreateDeposit, createDeposit);
router.get('/', validateListDeposits, getDeposits);
router.get('/:id', validateDepositById, getDepositById);
router.put('/:id', validateUpdateDepositAmount, updateDepositAmount);
router.delete('/:id', validateDepositById, deleteDeposit);
router.patch('/:id/revert', validateRevertDeposit, revertDeposit);

export default router;
