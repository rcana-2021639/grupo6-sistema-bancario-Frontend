import Card from './cards.model.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import { getUniqueCardNumber } from '../../helpers/card.helper.js';
import Account from '../shared/models/account.model.js';
import Transaction from '../../../Transaction-Processing-Service/src/transaction/transaction.model.js';

const resolveRequesterUserId = (req) => (
    req.user?.sub || req.user?.userId || req.userId || ''
);

const ensureCardOwnerOrAdmin = (req, card, actionMessage = 'operar esta tarjeta') => {
    const requesterRole = req.user?.role;
    const requesterUserId = resolveRequesterUserId(req);

    if (requesterRole === 'ADMIN_ROLE') {
        return;
    }

    if (!requesterUserId || String(card.userId) !== String(requesterUserId)) {
        const error = new Error(`No puedes ${actionMessage}`);
        error.statusCode = 403;
        throw error;
    }
};

const normalizeAccountNumber = (value) => String(value || '').toUpperCase().trim();

const buildPublicCard = (card) => {
    const plainCard = typeof card?.toObject === 'function' ? card.toObject() : { ...(card || {}) };
    plainCard.cardLastFour = String(plainCard.cardNumber || '').slice(-4);
    delete plainCard.cardNumber;
    delete plainCard.cvv;
    delete plainCard.pin;
    return plainCard;
};

const buildSensitiveCard = (card) => {
    const plainCard = typeof card?.toObject === 'function' ? card.toObject() : { ...(card || {}) };
    delete plainCard.pin;
    return plainCard;
};

// agregar
export const createCard = async (req, res) => {
    try {
        const cardData = { ...req.body };
        cardData.userId = String(cardData.userId || '').trim();
        cardData.accountNumber = normalizeAccountNumber(cardData.accountNumber);
        cardData.availableBalance = Number(cardData.availableBalance || 0);

        const user = await User.findOne({
            where: { Id: cardData.userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const account = await Account.findOne({ accountNumber: cardData.accountNumber });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta bancaria no encontrada'
            });
        }

        if (String(account.userId) !== String(cardData.userId)) {
            return res.status(400).json({
                success: false,
                message: 'La cuenta bancaria no pertenece al usuario seleccionado'
            });
        }

        if (account.status !== 'activa') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden crear tarjetas para cuentas activas'
            });
        }

        if (cardData.cardType === 'debito') {
            if (Number(account.balance || 0) < cardData.availableBalance) {
                return res.status(400).json({
                    success: false,
                    message: 'Saldo insuficiente en la cuenta para crear la tarjeta de debito'
                });
            }

            account.balance = Number((Number(account.balance || 0) - cardData.availableBalance).toFixed(2));
        }

        cardData.cardNumber = await getUniqueCardNumber();

        const card = new Card(cardData);
        await Promise.all([
            card.save(),
            cardData.cardType === 'debito' ? account.save() : Promise.resolve()
        ]);

        return res.status(201).json({
            success: true,
            message: 'Tarjeta creada exitosamente',
            data: buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al crear la tarjeta'
        });
    }
};

export const getCards = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'activa' } = req.query;
        const filter = status ? { status } : {};
        const numericPage = parseInt(page, 10);
        const numericLimit = parseInt(limit, 10);

        const cards = await Card.find(filter)
            .limit(numericLimit)
            .skip((numericPage - 1) * numericLimit)
            .sort({ createdAt: -1 });

        const total = await Card.countDocuments(filter);

        return res.status(200).json({
            success: true,
            data: cards.map(buildPublicCard),
            pagination: {
                currentPage: numericPage,
                totalPages: Math.ceil(total / numericLimit),
                totalRecords: total,
                limit: numericLimit
            }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener las tarjetas',
            error: error.message
        });
    }
};

export const getMyCards = async (req, res) => {
    try {
        const requesterUserId = req.user?.sub || req.user?.userId || req.userId || '';

        if (!requesterUserId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const cards = await Card.find({ userId: requesterUserId }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            data: cards.map(buildPublicCard)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tus tarjetas',
            error: error.message
        });
    }
};

export const updateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const cardData = { ...req.body };

        // Evitar que cambien el numero autogenerado por update
        delete cardData.cardNumber;
        delete cardData.status;

        if (cardData.userId) {
            cardData.userId = String(cardData.userId).trim();
            const user = await User.findOne({ where: { Id: cardData.userId } });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }
        }

        if (cardData.accountNumber) {
            cardData.accountNumber = normalizeAccountNumber(cardData.accountNumber);
            const account = await Account.findOne({ accountNumber: cardData.accountNumber });

            if (!account) {
                return res.status(404).json({
                    success: false,
                    message: 'Cuenta bancaria no encontrada'
                });
            }

            if (cardData.userId && String(account.userId) !== String(cardData.userId)) {
                return res.status(400).json({
                    success: false,
                    message: 'La cuenta bancaria no pertenece al usuario seleccionado'
                });
            }
        }

        const card = await Card.findByIdAndUpdate(
            id,
            cardData,
            { new: true, runValidators: true }
        );

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tarjeta actualizada exitosamente',
            data: buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar la tarjeta'
        });
    }
};


export const deleteCard = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await Card.findByIdAndDelete(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tarjeta eliminada exitosamente'
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al eliminar la tarjeta',
            error: error.message
        });
    }
};

export const getCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterUserId = req.user?.sub || req.user?.userId || req.userId || '';
        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        if (!requesterUserId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        if (req.user?.role !== 'ADMIN_ROLE' && String(card.userId) !== String(requesterUserId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes ver esta tarjeta'
            });
        }

        return res.status(200).json({
            success: true,
            data: buildSensitiveCard(card)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al buscar la tarjeta',
            error: error.message
        });
    }
};

export const getCardMovements = async (req, res) => {
    try {
        const { id } = req.params;
        const requesterRole = req.user?.role;
        const requesterUserId = req.user?.sub || req.user?.userId || req.userId || '';
        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        if (requesterRole !== 'ADMIN_ROLE' && String(card.userId) !== String(requesterUserId)) {
            return res.status(403).json({
                success: false,
                message: 'No puedes ver los movimientos de esta tarjeta'
            });
        }

        const accounts = await Account.find({ userId: card.userId }, { accountNumber: 1, _id: 0 });
        const accountNumbers = accounts.map((account) => account.accountNumber);

        if (!accountNumbers.length) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const movements = await Transaction.find({
            status: 'exitosa',
            $or: [
                { sourceAccountNumber: { $in: accountNumbers } },
                { destinationAccountNumber: { $in: accountNumbers } }
            ]
        }).sort({ createdAt: -1 }).limit(25);

        return res.status(200).json({
            success: true,
            data: movements
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener movimientos de tarjeta',
            error: error.message
        });
    }
};
export const changeCardStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const requesterRole = req.user?.role;
        const allowedStatus = requesterRole === 'ADMIN_ROLE'
            ? ['activa', 'bloqueada', 'cancelada', 'vencida']
            : ['activa', 'bloqueada', 'cancelada'];

        if (!allowedStatus.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no permitido'
            });
        }

        const existingCard = await Card.findById(id);

        if (!existingCard) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        try {
            ensureCardOwnerOrAdmin(req, existingCard, 'cambiar el estado de esta tarjeta');
        } catch (error) {
            return res.status(error.statusCode || 403).json({
                success: false,
                message: error.message
            });
        }

        const card = await Card.findByIdAndUpdate(
            id,
            { status },
            { new: true, runValidators: true }
        );

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Tarjeta ${status} correctamente`,
            data: buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al cambiar estado'
        });
    }
};

export const changeCardPin = async (req, res) => {
    try {
        const { id } = req.params;
        const { pin, currentPin } = req.body;
        const requesterRole = req.user?.role;
        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        try {
            ensureCardOwnerOrAdmin(req, card, 'cambiar el PIN de esta tarjeta');
        } catch (error) {
            return res.status(error.statusCode || 403).json({
                success: false,
                message: error.message
            });
        }

        if (requesterRole !== 'ADMIN_ROLE' && String(card.pin) !== String(currentPin || '')) {
            return res.status(400).json({
                success: false,
                message: 'El PIN actual no coincide'
            });
        }

        card.pin = pin;
        await card.save();

        return res.status(200).json({
            success: true,
            message: 'PIN actualizado correctamente',
            data: buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al cambiar el PIN'
        });
    }
};

export const setCardLimit = async (req, res) => {
    try {
        const { id } = req.params;
        const { creditLimit } = req.body;
        const card = await Card.findByIdAndUpdate(
            id,
            { creditLimit: Number(creditLimit) },
            { new: true, runValidators: true }
        );

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Limite de tarjeta actualizado correctamente',
            data: buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el limite de tarjeta'
        });
    }
};
