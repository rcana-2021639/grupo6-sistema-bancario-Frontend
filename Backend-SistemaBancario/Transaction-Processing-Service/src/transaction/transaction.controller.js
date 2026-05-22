import Transaction from './transaction.model.js';
import Account from '../shared/models/account.model.js';
import Deposit from '../deposits/deposits.model.js';
import Withdrawal from '../withdrawal/withdrawal.model.js';
import Product from '../shared/models/product.model.js';
import Card from '../shared/models/card.model.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import {
    normalizeTransactionData,
    validateAccountNumberFormat,
    validateCurrencyForTransaction,
    applyTransactionBalances,
    validateTransferLimits
} from '../../helpers/transaction.helper.js';
import { convertAmount, getExchangeRate } from '../../helpers/conversionCurrency.helper.js';

const roundToTwoDecimals = (value) => Number(Number(value || 0).toFixed(2));
const FORBIDDEN_TRANSACTION_MESSAGE = 'Esta transaccion no te pertenece';
const ADMINISTRATIVE_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];
const REVERSAL_WINDOW_MS = 30 * 60 * 1000;

const getRequesterContext = (req) => ({
    role: req.user?.role,
    userId: req.user?.sub || req.user?.userId || req.userId || ''
});

const validateAuthenticatedUser = async (userId) => {
    const user = await User.findOne({
        where: { Id: userId }
    });

    if (!user) {
        throw new Error('El usuario autenticado no existe en la base de datos');
    }

    if (!user.Status) {
        throw new Error('El usuario autenticado esta inactivo o bloqueado');
    }

    return user;
};

const validateSourceAccountOwnership = async (req, sourceAccountNumber) => {
    const { role, userId } = getRequesterContext(req);

    if (ADMINISTRATIVE_ROLES.includes(role)) {
        return { allowed: true };
    }

    const sourceAccount = await Account.findOne({ accountNumber: sourceAccountNumber });
    if (!sourceAccount) {
        return { allowed: false, notFound: true };
    }

    if (String(sourceAccount.userId) !== String(userId)) {
        return { allowed: false, notFound: false };
    }

    return { allowed: true };
};

const convertForAccount = async (amount, fromCurrency, accountCurrency) => (
    fromCurrency && accountCurrency && fromCurrency !== accountCurrency
        ? convertAmount(amount, fromCurrency, accountCurrency)
        : Number(amount)
);

const assertTransactionCanBeReversed = (transaction) => {
    if (transaction.status === 'reversada') {
        throw new Error('La transaccion ya fue reversada');
    }

    if (transaction.status !== 'exitosa') {
        throw new Error('Solo se pueden cancelar transacciones exitosas');
    }

    const createdAt = new Date(transaction.createdAt || transaction.transactionDate).getTime();
    if (!createdAt || Number.isNaN(createdAt)) {
        throw new Error('La transaccion no tiene fecha valida para calcular la ventana de cancelacion');
    }

    if (Date.now() - createdAt > REVERSAL_WINDOW_MS) {
        throw new Error('La transaccion solo puede cancelarse dentro de los primeros 30 minutos');
    }
};

const reverseTransferLikeTransaction = async (transaction, sourceAccount, destinationAccount) => {
    if (!sourceAccount) {
        throw new Error('No se encontro la cuenta origen para revertir la transaccion');
    }

    const creditBackToSource = roundToTwoDecimals(
        await convertForAccount(transaction.amount, transaction.currencyCode, sourceAccount.currencyCode)
    );
    const debitFromDestination = !destinationAccount || sourceAccount.accountNumber === destinationAccount.accountNumber
        ? 0
        : roundToTwoDecimals(
            await convertForAccount(transaction.amount, transaction.currencyCode, destinationAccount.currencyCode)
        );

    if (debitFromDestination > 0 && Number(destinationAccount.balance) < debitFromDestination) {
        throw new Error('No se puede cancelar: la cuenta destino no tiene saldo suficiente para revertir');
    }

    if (debitFromDestination > 0) {
        destinationAccount.balance = roundToTwoDecimals(Number(destinationAccount.balance) - debitFromDestination);
    }
    sourceAccount.balance = roundToTwoDecimals(Number(sourceAccount.balance) + creditBackToSource);

    await Promise.all([
        sourceAccount.save(),
        debitFromDestination > 0 ? destinationAccount.save() : Promise.resolve()
    ]);
};

const reverseDepositTransaction = async (transaction, account) => {
    if (!account) {
        throw new Error('No se encontro la cuenta del deposito');
    }

    const debitAmount = roundToTwoDecimals(
        await convertForAccount(transaction.amount, transaction.currencyCode, account.currencyCode)
    );

    if (Number(account.balance) < debitAmount) {
        throw new Error('No se puede revertir: el saldo actual es insuficiente');
    }

    account.balance = roundToTwoDecimals(Number(account.balance) - debitAmount);
    await account.save();

    await Deposit.findOneAndUpdate(
        {
            $or: [
                { transactionId: transaction._id },
                { _id: transaction.referenceType === 'deposit' ? transaction.referenceId : null }
            ]
        },
        {
            status: 'reversada',
            reversedAt: new Date(),
            previousBalance: transaction.newBalance,
            newBalance: account.balance
        },
        { new: true }
    );
};

const reverseWithdrawalTransaction = async (transaction, account) => {
    if (!account) {
        throw new Error('No se encontro la cuenta del retiro');
    }

    const creditAmount = roundToTwoDecimals(
        await convertForAccount(transaction.amount, transaction.currencyCode, account.currencyCode)
    );

    account.balance = roundToTwoDecimals(Number(account.balance) + creditAmount);
    await account.save();

    await Withdrawal.findOneAndUpdate(
        {
            $or: [
                { transactionId: transaction._id },
                { _id: transaction.referenceType === 'withdrawal' ? transaction.referenceId : null }
            ]
        },
        {
            status: 'reversada',
            reversedAt: new Date()
        },
        { new: true }
    );
};

const reverseProductReference = async (transaction) => {
    if (transaction.referenceType !== 'product') return;

    const quantity = Number(transaction.metadata?.quantity || 0);
    if (!transaction.referenceId || quantity <= 0) {
        throw new Error('No se puede cancelar esta compra: faltan datos para restaurar el producto');
    }

    const product = await Product.findById(transaction.referenceId);
    if (!product) {
        throw new Error('No se encontro el producto asociado a la compra');
    }

    product.stock = Number(product.stock || 0) + quantity;
    await product.save();
};

const reverseCardReference = async (transaction, sourceAccount) => {
    if (transaction.referenceType !== 'card') return;

    if (!transaction.referenceId) {
        throw new Error('No se puede cancelar este consumo: falta la tarjeta asociada');
    }

    const card = await Card.findById(transaction.referenceId);
    if (!card) {
        throw new Error('No se encontro la tarjeta asociada al consumo');
    }

    if (card.cardType === 'credito') {
        const accountCurrency = sourceAccount?.currencyCode || transaction.currencyCode;
        const amountInCardCurrency = roundToTwoDecimals(
            await convertForAccount(transaction.amount, transaction.currencyCode, accountCurrency)
        );
        card.currentCycleBalance = roundToTwoDecimals(Math.max(0, Number(card.currentCycleBalance || 0) - amountInCardCurrency));
        card.availableBalance = roundToTwoDecimals(Number(card.creditLimit || 0) - Number(card.currentCycleBalance || 0));
    } else if (sourceAccount) {
        card.availableBalance = roundToTwoDecimals(sourceAccount.balance);
    }

    await card.save();
};

//agregar
export const createTransaction = async (req, res) => {
    try {
        const transactionData = normalizeTransactionData(req.body);
        const { sourceAccountNumber, destinationAccountNumber } = transactionData;
        const requesterRole = req.user?.role;
        const requesterUserId = req.user?.sub || req.user?.userId || req.userId || '';

        if (transactionData.userId && String(transactionData.userId) !== String(requesterUserId)) {
            return res.status(403).json({
                success: false,
                message: 'El userId enviado no coincide con el usuario autenticado'
            });
        }

        // Forzar que el ejecutor sea el usuario autenticado (no confiar en el cliente)
        transactionData.executedByUserId = requesterUserId;

        validateAccountNumberFormat(sourceAccountNumber, 'sourceAccountNumber');
        validateAccountNumberFormat(destinationAccountNumber, 'destinationAccountNumber');

        if (!transactionData.executedByUserId) {
            throw new Error('El usuario que ejecuta la transaccion es requerido');
        }

        await validateAuthenticatedUser(transactionData.executedByUserId);

        if (sourceAccountNumber === destinationAccountNumber && transactionData.transactionType === 'transferencia') {
            throw new Error('La cuenta origen y destino no pueden ser la misma en una transferencia');
        }

        const [sourceAccount, destinationAccount] = await Promise.all([
            Account.findOne({ accountNumber: sourceAccountNumber }),
            Account.findOne({ accountNumber: destinationAccountNumber })
        ]);

        if (!sourceAccount || !destinationAccount) {
            return res.status(404).json({
                success: false,
                message: 'Una o ambas cuentas no existen'
            });
        }

        await validateCurrencyForTransaction(transactionData.currencyCode, sourceAccount, destinationAccount);

        // Si el solicitante es un usuario normal, asegurar que la cuenta origen le pertenece
        if (requesterRole === 'USER_ROLE') {
            if (String(sourceAccount.userId) !== String(requesterUserId)) {
                // Intentar obtener una cuenta propia para mostrar en el mensaje, si existe
                const ownAccount = await Account.findOne({ userId: requesterUserId });
                const ownAccountNumber = ownAccount ? ownAccount.accountNumber : 'ACC-000-0000';

                return res.status(403).json({
                    success: false,
                    message: `esta cuenta no te pertenece la tuya es ${ownAccountNumber}`
                });
            }
        }

        // Valida reglas de negocio para transferencias:
        // maximo por operacion (Q2000), saldo disponible y limite diario (Q10000).
        await validateTransferLimits({
            transactionType: transactionData.transactionType,
            sourceAccountNumber,
            amount: Number(transactionData.amount),
            sourceAccount
        });

        const { previousBalance, newBalance } = await applyTransactionBalances({
            transactionType: transactionData.transactionType,
            amount: Number(transactionData.amount),
            sourceAccount,
            destinationAccount,
            transactionCurrency: transactionData.currencyCode
        });

        sourceAccount.balance = roundToTwoDecimals(sourceAccount.balance);
        destinationAccount.balance = roundToTwoDecimals(destinationAccount.balance);
        transactionData.previousBalance = roundToTwoDecimals(previousBalance);
        transactionData.newBalance = roundToTwoDecimals(newBalance);

        await Promise.all([
            sourceAccount.save(),
            destinationAccount.save()
        ]);

        const transaction = new Transaction(transactionData);
        await transaction.save();

        res.status(201).json({
            success: true,
            message: 'TransacciÃ³n creada exitosamente',
            data: transaction
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la transacciÃ³n',
            error: error.message
        })
    }
}

export const getTransactions = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'exitosa' } = req.query;
        const { role, userId } = getRequesterContext(req);
        const numericPage = Math.max(parseInt(page, 10) || 1, 1);
        const numericLimit = Math.max(parseInt(limit, 10) || 10, 1);
        const filter = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (!ADMINISTRATIVE_ROLES.includes(role)) {
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            const userAccounts = await Account.find(
                { userId },
                { accountNumber: 1, _id: 0 }
            );
            const accountNumbers = userAccounts.map((account) => account.accountNumber);

            filter.$or = [
                { executedByUserId: userId },
                { sourceAccountNumber: { $in: accountNumbers } },
                { destinationAccountNumber: { $in: accountNumbers } }
            ];
        }

        const options = {
            page: numericPage,
            limit: numericLimit,
            sort: { createdAt: -1 }
        }

        const transactions = await Transaction.find(filter)
            .limit(numericLimit)
            .skip((numericPage - 1) * numericLimit)
            .sort(options.sort);
        const total = await Transaction.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: transactions,
            pagination: {
                currentPage: numericPage,
                totalPages: Math.ceil(total / numericLimit),
                totalRecords: total,
                limit: numericLimit
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las transacciones',    
            error: error.message
        })
    }

}

export const getFavorites = async (req, res) => {
    try {
        const requesterUserId = req.user?.sub || req.user?.userId || req.userId || '';

        if (!requesterUserId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const favoriteTransactions = await Transaction.find(
            {
                executedByUserId: requesterUserId,
                favorito: true,
                destinationAccountNumber: { $nin: [null, ''] }
            },
            { destinationAccountNumber: 1, alias: 1, _id: 0 }
        ).sort({ createdAt: -1 });

        const favoritesByAccount = new Map();
        for (const tx of favoriteTransactions) {
            const accountNumber = tx.destinationAccountNumber;
            if (!accountNumber || favoritesByAccount.has(accountNumber)) {
                continue;
            }

            favoritesByAccount.set(accountNumber, {
                accountNumber,
                alias: String(tx.alias || '').trim()
            });
        }

        const uniqueAccountNumbers = [...favoritesByAccount.keys()];

        if (uniqueAccountNumbers.length === 0) {
            return res.status(200).json({
                success: true,
                data: []
            });
        }

        const destinationAccounts = await Account.find(
            { accountNumber: { $in: uniqueAccountNumbers } },
            { accountNumber: 1, name: 1, _id: 0 }
        );

        const accountByNumber = new Map(
            destinationAccounts.map((acc) => [acc.accountNumber, acc])
        );

        const favorites = uniqueAccountNumbers.map((accountNumber) => {
            const account = accountByNumber.get(accountNumber);
            const favorite = favoritesByAccount.get(accountNumber);
            return {
                accountNumber,
                name: account?.name || '',
                alias: favorite?.alias || ''
            };
        });

        return res.status(200).json({
            success: true,
            data: favorites
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener favoritos',
            error: error.message
        });
    }
}

export const updateTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const transactionData = { ...req.body };

        const existingTransaction = await Transaction.findById(id);
        if (!existingTransaction) {
            return res.status(404).json({ success: false, message: 'Transacción no encontrada' });
        }

        const ownership = await validateSourceAccountOwnership(req, existingTransaction.sourceAccountNumber);
        if (ownership.notFound) {
            return res.status(404).json({ success: false, message: 'Cuenta origen no encontrada' });
        }
        if (!ownership.allowed) {
            return res.status(403).json({
                success: false,
                message: FORBIDDEN_TRANSACTION_MESSAGE
            });
        }

        if (Object.prototype.hasOwnProperty.call(transactionData, 'favorito')) {
            const favoriteValue =
                transactionData.favorito === true ||
                transactionData.favorito === 'true' ||
                transactionData.favorito === 1 ||
                transactionData.favorito === '1';

            transactionData.favorito = favoriteValue;
            if (!favoriteValue) {
                transactionData.alias = '';
            } else if (Object.prototype.hasOwnProperty.call(transactionData, 'alias')) {
                transactionData.alias = String(transactionData.alias || '').trim();
            }
        } else if (Object.prototype.hasOwnProperty.call(transactionData, 'alias')) {
            const currentFavorite = Boolean(existingTransaction.favorito);
            transactionData.alias = currentFavorite ? String(transactionData.alias || '').trim() : '';
        }

        const transaction = await Transaction.findByIdAndUpdate(
            id,
            transactionData,
            { new: true, runValidators: true }
        );
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transacción actualizada exitosamente',
            data: transaction
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar la transacción',
            error: error.message
        });
    }
}
export const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId: requesterUserId } = getRequesterContext(req);
        const cancelReason = String(req.body?.cancelReason || '').trim();
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            })
        }

        const ownership = await validateSourceAccountOwnership(req, transaction.sourceAccountNumber);
        if (ownership.notFound) {
            return res.status(404).json({ success: false, message: 'Cuenta origen no encontrada' });
        }
        if (!ownership.allowed) {
            return res.status(403).json({
                success: false,
                message: FORBIDDEN_TRANSACTION_MESSAGE
            });
        }

        if (cancelReason.length < 8 || cancelReason.length > 200) {
            return res.status(400).json({
                success: false,
                message: 'El motivo de cancelacion debe tener entre 8 y 200 caracteres'
            });
        }

        assertTransactionCanBeReversed(transaction);

        const [sourceAccount, destinationAccount] = await Promise.all([
            transaction.sourceAccountNumber
                ? Account.findOne({ accountNumber: transaction.sourceAccountNumber })
                : Promise.resolve(null),
            transaction.destinationAccountNumber
                ? Account.findOne({ accountNumber: transaction.destinationAccountNumber })
                : Promise.resolve(null)
        ]);

        if (transaction.transactionType === 'deposito') {
            await reverseDepositTransaction(transaction, destinationAccount || sourceAccount);
        } else if (transaction.transactionType === 'retiro') {
            await reverseWithdrawalTransaction(transaction, sourceAccount || destinationAccount);
        } else if (transaction.transactionType === 'compra_tarjeta') {
            const card = transaction.referenceType === 'card' && transaction.referenceId
                ? await Card.findById(transaction.referenceId)
                : null;

            if (card?.cardType === 'credito') {
                await reverseCardReference(transaction, sourceAccount);
            } else {
                await reverseWithdrawalTransaction(transaction, sourceAccount || destinationAccount);
                if (transaction.referenceType === 'card') {
                    await reverseCardReference(transaction, sourceAccount);
                }
            }
        } else {
            await reverseProductReference(transaction);
            await reverseTransferLikeTransaction(transaction, sourceAccount, destinationAccount);
        }

        transaction.status = 'reversada';
        transaction.reversedAt = new Date();
        transaction.metadata = {
            ...(transaction.metadata || {}),
            cancellationReason: cancelReason,
            reversedByUserId: requesterUserId
        };
        transaction.description = `${transaction.description || 'Transaccion'} (reversada)`;
        await transaction.save();

        return res.status(200).json({
            success: true,
            message: 'Transaccion cancelada y reversada exitosamente',
            data: transaction
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al cancelar la transaccion',
            error: error.message
        })
    }
}
export const getTransactionById = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacción no encontrada'
            });
        }

        const ownership = await validateSourceAccountOwnership(req, transaction.sourceAccountNumber);
        if (ownership.notFound) {
            return res.status(404).json({ success: false, message: 'Cuenta origen no encontrada' });
        }
        if (!ownership.allowed) {
            return res.status(403).json({
                success: false,
                message: FORBIDDEN_TRANSACTION_MESSAGE
            });
        }

        res.status(200).json({
            success: true,
            data: transaction
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar la transacción',
            error: error.message
        });
    }
};

export const convertCurrency = async (req, res) => {
    try {
        const amount = Number(req.query.amount);
        const from = String(req.query.from || '').toUpperCase().trim();
        const to = String(req.query.to || '').toUpperCase().trim();

        if (Number.isNaN(amount) || amount < 0) {
            return res.status(400).json({
                success: false,
                message: 'amount debe ser un numero positivo'
            });
        }

        if (!/^[A-Z]{3}$/.test(from) || !/^[A-Z]{3}$/.test(to)) {
            return res.status(400).json({
                success: false,
                message: 'from y to deben tener formato ABC'
            });
        }

        const [convertedAmount, rate] = from === to
            ? [amount, 1]
            : [await convertAmount(amount, from, to), await getExchangeRate(from, to)];

        return res.status(200).json({
            success: true,
            data: {
                amount,
                from,
                to,
                rate,
                convertedAmount: roundToTwoDecimals(convertedAmount)
            }
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: 'Error al convertir divisas',
            error: error.message
        });
    }
};
