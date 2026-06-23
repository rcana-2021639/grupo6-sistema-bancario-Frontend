import { Op } from 'sequelize';
import { User } from '../users/user.model.js';
import { BenefitRedemption } from './benefit-redemption.model.js';
import { getUserRoleNames } from '../../helpers/role-db.js';

const MAX_REDEMPTIONS = 2;
const BENEFIT_IDS = [
    'salon-lumina-50',
    'cafe-bruma-2x1',
    'cine-nova-entrada',
    'fit-club-semana',
    'book-house-30',
    'hotel-vento-brunch',
];

const hashValue = (input) => {
    let hash = 2166136261;
    for (let index = 0; index < input.length; index += 1) {
        hash ^= input.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36).toUpperCase().padStart(7, '0').slice(0, 7);
};

const buildRedemptionCode = (userId, benefitId) => {
    const prefix = benefitId.split('-').slice(0, 2).join('').slice(0, 5).toUpperCase();
    return `LUM-${prefix}-${hashValue(`${String(userId).toLowerCase()}:${benefitId}`)}`;
};

const serializeRedemption = (redemption) => ({
    benefitId: redemption.BenefitId,
    code: redemption.Code,
    redeemedAt: redemption.RedeemedAt,
});

const getStateForUserId = async (userId) => {
    const redemptions = await BenefitRedemption.findAll({
        where: { UserId: userId },
        order: [['RedeemedAt', 'ASC']],
    });

    return {
        redemptions: redemptions.map(serializeRedemption),
        remaining: Math.max(MAX_REDEMPTIONS - redemptions.length, 0),
        maxRedemptions: MAX_REDEMPTIONS,
    };
};

const isAdmin = async (userId) => {
    const roles = await getUserRoleNames(userId);
    return roles.includes('ADMIN_ROLE');
};

const resolveUser = async (identifier) => {
    const value = String(identifier || '').trim();
    if (!value) return null;

    return User.findOne({
        where: {
            [Op.or]: [
                { Id: value },
                { Email: value },
                { Username: value },
            ],
        },
    });
};

export const getMyBenefits = async (req, res) => {
    const state = await getStateForUserId(req.userId);
    return res.status(200).json({ success: true, data: state });
};

export const redeemBenefit = async (req, res) => {
    const benefitId = String(req.body?.benefitId || '').trim();
    if (!BENEFIT_IDS.includes(benefitId)) {
        return res.status(400).json({ success: false, message: 'Beneficio no valido' });
    }

    const existing = await BenefitRedemption.findOne({
        where: { UserId: req.userId, BenefitId: benefitId },
    });

    if (existing) {
        return res.status(200).json({
            success: true,
            alreadyRedeemed: true,
            redemption: serializeRedemption(existing),
            data: await getStateForUserId(req.userId),
        });
    }

    const count = await BenefitRedemption.count({ where: { UserId: req.userId } });
    if (count >= MAX_REDEMPTIONS) {
        return res.status(409).json({
            success: false,
            message: 'Ya canjeaste tus 2 beneficios disponibles.',
            data: await getStateForUserId(req.userId),
        });
    }

    const redemption = await BenefitRedemption.create({
        UserId: req.userId,
        BenefitId: benefitId,
        Code: buildRedemptionCode(req.userId, benefitId),
    });

    return res.status(201).json({
        success: true,
        alreadyRedeemed: false,
        redemption: serializeRedemption(redemption),
        data: await getStateForUserId(req.userId),
    });
};

export const getUserBenefits = async (req, res) => {
    if (!(await isAdmin(req.userId))) {
        return res.status(403).json({ success: false, message: 'Solo ADMIN_ROLE puede consultar beneficios de usuarios.' });
    }

    const user = await resolveUser(req.params.userIdentifier);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    return res.status(200).json({ success: true, data: await getStateForUserId(user.Id) });
};

export const resetUserBenefits = async (req, res) => {
    if (!(await isAdmin(req.userId))) {
        return res.status(403).json({ success: false, message: 'Solo ADMIN_ROLE puede habilitar beneficios.' });
    }

    const user = await resolveUser(req.body?.userIdentifier || req.body?.userId);
    if (!user) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });

    await BenefitRedemption.destroy({ where: { UserId: user.Id } });

    return res.status(200).json({
        success: true,
        message: 'Cupo de beneficios reiniciado',
        data: await getStateForUserId(user.Id),
    });
};

