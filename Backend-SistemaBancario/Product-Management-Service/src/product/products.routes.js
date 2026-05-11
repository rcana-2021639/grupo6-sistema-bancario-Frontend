import { Router } from 'express';
import {
    createProduct,
    deleteProduct,
    getProductById,
    getProducts,
    purchaseProduct,
    updateProduct
} from './products.controller.js';
import {
    validateCreateProduct,
    validateProductId,
    validatePurchaseProduct,
    validateUpdateProduct
} from '../../middlewares/product-validators.js';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import { requireRole } from '../../middlewares/validate-role.js';

const router = Router();

router.post('/create', validateCreateProduct, createProduct);
router.get(
    '/',
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE', 'USER_ROLE'),
    getProducts
);
router.get('/:id', validateProductId, getProductById);
router.put('/:id', validateUpdateProduct, updateProduct);
router.delete(
    '/:id',
    validateJWT,
    requireRole('ADMIN_ROLE', 'MANAGER_ROLE'),
    validateProductId,
    deleteProduct
);
router.post('/:id/purchase', validatePurchaseProduct, purchaseProduct);

export default router;
