import { Router } from 'express';
import { validateJWT } from '../../middlewares/validate-JWT.js';
import {
    getMyBenefits,
    getUserBenefits,
    redeemBenefit,
    resetUserBenefits,
} from './benefits.controller.js';

const router = Router();

router.get('/me', validateJWT, getMyBenefits);
router.post('/redeem', validateJWT, redeemBenefit);
router.get('/user/:userIdentifier', validateJWT, getUserBenefits);
router.post('/reset', validateJWT, resetUserBenefits);

export default router;

