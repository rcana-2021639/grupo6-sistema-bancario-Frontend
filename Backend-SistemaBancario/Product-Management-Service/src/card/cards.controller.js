import Card from './cards.model.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import { getUniqueCardNumber } from '../../helpers/card.helper.js';
import Account from '../shared/models/account.model.js';
import Transaction from '../shared/models/transaction.model.js';
import { convertAmount } from '../../../Transaction-Processing-Service/helpers/conversionCurrency.helper.js';

const DEFAULT_CREDIT_LIMIT = 60000;

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
const roundToTwoDecimals = (value) => Number(Number(value || 0).toFixed(2));
const getCurrentBillingCycle = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
};

const calculateCardAvailability = async (card, account = null) => {
    if (!card) return { availableBalance: 0, creditLimit: 0 };
    const linkedAccount = account || await Account.findOne({ accountNumber: card.accountNumber });

    if (card.cardType === 'debito') {
        return {
            availableBalance: roundToTwoDecimals(linkedAccount?.balance || 0),
            currencyCode: linkedAccount?.currencyCode || 'GTQ',
            creditLimit: 0,
            currentCycleBalance: 0,
            billingCycle: ''
        };
    }

    const creditLimit = roundToTwoDecimals(card.creditLimit || DEFAULT_CREDIT_LIMIT);
    const currentCycle = getCurrentBillingCycle();
    const currentCycleBalance = card.billingCycle === currentCycle
        ? roundToTwoDecimals(card.currentCycleBalance || 0)
        : 0;

    return {
        availableBalance: roundToTwoDecimals(Math.max(0, creditLimit - currentCycleBalance)),
            currencyCode: linkedAccount?.currencyCode || 'GTQ',
            creditLimit,
        currentCycleBalance,
        billingCycle: currentCycle
    };
};

const buildPublicCard = async (card, account = null) => {
    const plainCard = typeof card?.toObject === 'function' ? card.toObject() : { ...(card || {}) };
    const availability = await calculateCardAvailability(card, account);
    Object.assign(plainCard, availability);
    plainCard.cardLastFour = String(plainCard.cardNumber || '').slice(-4);
    delete plainCard.cardNumber;
    delete plainCard.cvv;
    delete plainCard.pin;
    return plainCard;
};

const buildSensitiveCard = async (card) => {
    const plainCard = typeof card?.toObject === 'function' ? card.toObject() : { ...(card || {}) };
    const availability = await calculateCardAvailability(card);
    Object.assign(plainCard, availability);
    delete plainCard.pin;
    return plainCard;
};

// agregar
export const createCard = async (req, res) => {
    try {
        const cardData = { ...req.body };
        cardData.userId = String(cardData.userId || '').trim();
        cardData.accountNumber = normalizeAccountNumber(cardData.accountNumber);

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
            cardData.creditLimit = 0;
            cardData.currentCycleBalance = 0;
            cardData.billingCycle = '';
            cardData.availableBalance = roundToTwoDecimals(account.balance);
        } else {
            cardData.creditLimit = DEFAULT_CREDIT_LIMIT;
            cardData.currentCycleBalance = 0;
            cardData.billingCycle = getCurrentBillingCycle();
            cardData.availableBalance = DEFAULT_CREDIT_LIMIT;
        }

        cardData.cardNumber = await getUniqueCardNumber();

        const card = new Card(cardData);
        await card.save();

        return res.status(201).json({
            success: true,
            message: 'Tarjeta creada exitosamente',
            data: await buildPublicCard(card, account)
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

        const publicCards = await Promise.all(cards.map((card) => buildPublicCard(card)));

        return res.status(200).json({
            success: true,
            data: publicCards,
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

        const publicCards = await Promise.all(cards.map((card) => buildPublicCard(card)));

        return res.status(200).json({
            success: true,
            data: publicCards
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
        delete cardData.availableBalance;
        delete cardData.currentCycleBalance;
        delete cardData.billingCycle;

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
            data: await buildPublicCard(card)
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
            data: await buildSensitiveCard(card)
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

export const consumeCard = async (req, res) => {
    try {
        const { id } = req.params;
        const amount = Number(req.body.amount);
        const currencyCode = String(req.body.currencyCode || '').toUpperCase().trim();
        const description = String(req.body.description || 'Consumo con tarjeta').trim();
        const requesterUserId = resolveRequesterUserId(req);

        if (Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'El monto debe ser mayor a 0'
            });
        }

        const card = await Card.findById(id);

        if (!card) {
            return res.status(404).json({
                success: false,
                message: 'Tarjeta no encontrada'
            });
        }

        try {
            ensureCardOwnerOrAdmin(req, card, 'consumir con esta tarjeta');
        } catch (error) {
            return res.status(error.statusCode || 403).json({
                success: false,
                message: error.message
            });
        }

        if (card.status !== 'activa') {
            return res.status(400).json({
                success: false,
                message: `La tarjeta debe estar activa para registrar consumos. Estado actual: ${card.status}`
            });
        }

        const account = await Account.findOne({ accountNumber: card.accountNumber });

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Cuenta bancaria no encontrada'
            });
        }

        if (account.status !== 'activa') {
            return res.status(400).json({
                success: false,
                message: 'La cuenta vinculada debe estar activa'
            });
        }

        const transactionCurrency = currencyCode || account.currencyCode;
        const amountInAccountCurrency = transactionCurrency !== account.currencyCode
            ? await convertAmount(amount, transactionCurrency, account.currencyCode)
            : amount;
        const previousBalance = roundToTwoDecimals(account.balance);
        let newBalance = previousBalance;

        if (card.cardType === 'debito') {
            if (previousBalance < amountInAccountCurrency) {
                return res.status(400).json({
                    success: false,
                    message: 'Saldo insuficiente en la cuenta para este consumo'
                });
            }

            newBalance = roundToTwoDecimals(previousBalance - amountInAccountCurrency);
            account.balance = newBalance;
            card.availableBalance = newBalance;
        } else {
            const currentCycle = getCurrentBillingCycle();
            if (card.billingCycle !== currentCycle) {
                card.billingCycle = currentCycle;
                card.currentCycleBalance = 0;
            }

            card.creditLimit = roundToTwoDecimals(card.creditLimit || DEFAULT_CREDIT_LIMIT);
            const amountInCreditCurrency = transactionCurrency !== account.currencyCode
                ? await convertAmount(amount, transactionCurrency, account.currencyCode)
                : amount;
            const nextCycleBalance = roundToTwoDecimals(Number(card.currentCycleBalance || 0) + Number(amountInCreditCurrency || 0));

            if (nextCycleBalance > card.creditLimit) {
                return res.status(400).json({
                    success: false,
                    message: 'El consumo excede el limite disponible de la tarjeta de credito'
                });
            }

            card.currentCycleBalance = nextCycleBalance;
            card.availableBalance = roundToTwoDecimals(card.creditLimit - card.currentCycleBalance);
        }

        const transaction = await Transaction.create({
            sourceAccountNumber: account.accountNumber,
            destinationAccountNumber: account.accountNumber,
            transactionType: 'compra_tarjeta',
            amount: roundToTwoDecimals(amount),
            currencyCode: transactionCurrency,
            transactionDate: new Date(),
            description,
            status: 'exitosa',
            previousBalance,
            newBalance,
            executedByUserId: requesterUserId || card.userId,
            referenceType: 'card',
            referenceId: String(card._id)
        });

        await Promise.all([
            card.save(),
            card.cardType === 'debito' ? account.save() : Promise.resolve()
        ]);

        return res.status(201).json({
            success: true,
            message: 'Consumo registrado exitosamente',
            data: {
                card: await buildPublicCard(card, account),
                transaction,
                accountBalance: newBalance
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al registrar consumo de tarjeta'
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
            data: await buildPublicCard(card)
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
            data: await buildPublicCard(card)
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
            data: await buildPublicCard(card)
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Error al actualizar el limite de tarjeta'
        });
    }
};
