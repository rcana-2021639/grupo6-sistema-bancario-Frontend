import { Router } from 'express';
import { createAccount, getAccounts, getMyAccounts, updateAccount, deleteAccount, changeAccountStatus, getAccountByAccountNumber } from './accounts.controller.js';
import { validateCreateAccount, validateUpdateAccount, validateAccountById, validateReadAccountById, validateChangeAccountStatus } from '../../middlewares/accounts-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.post(
  '/create',
  validateJWT,
  validateCreateAccount,
  createAccount
);
router.get(
  '/',
  validateJWT,
  requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'),
  getAccounts
);
router.get(
  '/me',
  validateJWT,
  requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
  getMyAccounts
);
router.put(
  '/:accountNumber',
  validateJWT,
  validateUpdateAccount,
  updateAccount
);
router.delete(
  '/:accountNumber',
  validateJWT,
  validateAccountById,
  deleteAccount
);
router.get(
  '/:accountNumber',
  validateJWT,
  validateReadAccountById,
  getAccountByAccountNumber
);
router.patch(
  '/:accountNumber/status',
  validateChangeAccountStatus,
  changeAccountStatus
);

export default router;
