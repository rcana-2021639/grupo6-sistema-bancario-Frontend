import Loan from './loans.model.js';
import Account from '../shared/models/account.model.js';
import Deposit from '../../../Transaction-Processing-Service/src/deposits/deposits.model.js';
import Transaction from '../../../Transaction-Processing-Service/src/transaction/transaction.model.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import { getUserRoleNames } from '../../../Auth-Service/helpers/role-db.js';

const APPROVER_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];
const ADMINISTRATIVE_ROLES = ['ADMIN_ROLE', 'MANAGER_ROLE', 'ATM_ROLE'];
const APPROVAL_STATUSES = ['aprobado', 'rechazado', 'desembolsado'];
const LOCKED_AFTER_DISBURSEMENT_FIELDS = ['requestedAmount', 'accountNumber', 'userId'];

const roundToTwoDecimals = (value) => Number(Number(value || 0).toFixed(2));

const getRequesterContext = (req) => ({
    role: req.user?.role,
    userId: req.user?.sub || req.user?.userId || req.userId || ''
});

const listOwnLoanIds = async (userId) => {
    const ownLoans = await Loan.find({ userId }).select('_id').limit(20);
    const loanIds = ownLoans.map((loan) => String(loan._id));
    return loanIds.length > 0 ? loanIds.join(',') : 'ninguno';
};

const validateExistingUser = async (userId) => {
    const user = await User.findOne({
        where: { Id: userId }
    });

    if (!user) {
        throw new Error('El usuario indicado no existe en la base de datos');
    }

    if (!user.Status) {
        throw new Error('El usuario indicado esta inactivo o bloqueado');
    }

    return user;
};

const validateApproverUser = async (approvedByUserId) => {
    if (!approvedByUserId) {
        return null;
    }

    await validateExistingUser(approvedByUserId);
    const roleNames = await getUserRoleNames(approvedByUserId);
    const hasAllowedRole = roleNames.some((roleName) => APPROVER_ROLES.includes(roleName));

    if (!hasAllowedRole) {
        throw new Error('approvedByUserId debe pertenecer a un usuario con rol ADMIN_ROLE, MANAGER_ROLE o ATM_ROLE');
    }

    return true;
};

const validateLoanActor = ({ requesterRole, requesterUserId, targetUserId }) => {
    if (ADMINISTRATIVE_ROLES.includes(requesterRole)) {
        return true;
    }

    if (!targetUserId || String(targetUserId) !== String(requesterUserId)) {
        throw new Error('No puedes usar un userId distinto al de tu token');
    }

    return true;
};

const validateAccountOwnershipForLoan = async ({ accountNumber, targetUserId }) => {
    const account = await Account.findOne({ accountNumber });

    if (!account) {
        throw new Error('La cuenta asociada al prestamo no existe');
    }

    if (String(account.userId) !== String(targetUserId)) {
        throw new Error('No puedes crear o modificar prestamos con cuentas que no te pertenecen');
    }

    if (account.status !== 'activa') {
        throw new Error('La cuenta asociada al prestamo debe estar activa');
    }

    return account;
};

const hasChangedValue = (nextValue, currentValue) => {
    if (typeof currentValue === 'number') {
        return Number(nextValue) !== Number(currentValue);
    }

    return String(nextValue) !== String(currentValue);
};

const validateDisbursedLoanLockedFields = (loanData, existingLoan) => {
    const hasDisbursement = existingLoan.status === 'desembolsado'
        || existingLoan.disbursementDepositId
        || existingLoan.disbursementTransactionId;

    if (!hasDisbursement) {
        return;
    }

    if (loanData.status && !['aprobado', 'desembolsado', 'pagado', 'vencido'].includes(loanData.status)) {
        throw new Error('No se puede revertir un prestamo desembolsado a un estado anterior');
    }

    const changedField = LOCKED_AFTER_DISBURSEMENT_FIELDS.find((field) => (
        Object.prototype.hasOwnProperty.call(loanData, field)
        && hasChangedValue(loanData[field], existingLoan[field])
    ));

    if (changedField) {
        throw new Error(`No se puede modificar ${changedField} despues de desembolsar el prestamo`);
    }
};

const disburseLoanAmount = async ({ loanId, loanData, existingLoan, account, executedByUserId }) => {
    const amount = roundToTwoDecimals(loanData.requestedAmount ?? existingLoan.requestedAmount);

    if (Number.isNaN(amount) || amount <= 0) {
        throw new Error('El monto solicitado debe ser mayor a 0 para desembolsar el prestamo');
    }

    const previousBalance = roundToTwoDecimals(account.balance);
    const newBalance = roundToTwoDecimals(previousBalance + amount);
    const description = `Desembolso de prestamo ${loanId}`;
    const disbursementDate = loanData.disbursementDate || new Date();

    account.balance = newBalance;
    await account.save();

    const deposit = await Deposit.create({
        accountNumber: account.accountNumber,
        amount,
        currencyCode: account.currencyCode,
        description,
        status: 'exitosa',
        previousBalance,
        newBalance,
        executedByUserId
    });

    const transaction = await Transaction.create({
        sourceAccountNumber: account.accountNumber,
        destinationAccountNumber: account.accountNumber,
        transactionType: 'deposito',
        amount,
        currencyCode: account.currencyCode,
        transactionDate: disbursementDate,
        description,
        status: 'exitosa',
        previousBalance,
        newBalance,
        executedByUserId
    });

    deposit.transactionId = transaction._id;
    await deposit.save();

    loanData.approvedAmount = roundToTwoDecimals(loanData.approvedAmount ?? amount);
    loanData.outstandingBalance = roundToTwoDecimals(loanData.outstandingBalance ?? amount);
    loanData.disbursementDepositId = deposit._id;
    loanData.disbursementTransactionId = transaction._id;
    loanData.disbursementDate = disbursementDate;
};

export const createLoan = async (req, res) => {
    try {
        const loanData = { ...req.body };
        const { role: requesterRole, userId: requesterUserId } = getRequesterContext(req);

        if (!loanData.userId) {
            loanData.userId = requesterUserId;
        }

        validateLoanActor({
            requesterRole,
            requesterUserId,
            targetUserId: loanData.userId
        });

        await validateExistingUser(loanData.userId);
        await validateApproverUser(loanData.approvedByUserId);
        await validateAccountOwnershipForLoan({
            accountNumber: loanData.accountNumber,
            targetUserId: loanData.userId
        });

        const loan = new Loan(loanData);
        await loan.save();

        res.status(201).json({
            success: true,
            message: 'Prestamo creado exitosamente',
            data: loan
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el prestamo',
            error: error.message
        });
    }
};

export const getLoans = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = 'solicitado' } = req.query;
        const filter = {};
        if (status && status !== 'all') {
            filter.status = status;
        }
        const options = {
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
            sort: { createdAt: -1 }
        };

        const loans = await Loan.find(filter)
            .limit(options.limit)
            .skip((options.page - 1) * options.limit)
            .sort(options.sort);
        const total = await Loan.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: loans,
            pagination: {
                currentPage: options.page,
                totalPages: Math.ceil(total / options.limit),
                totalRecords: total,
                limit: options.limit
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el prestamo',
            error: error.message
        });
    }
};

export const getMyLoans = async (req, res) => {
    try {
        const status = req.query.status || 'solicitado';
        const { userId: requesterUserId } = getRequesterContext(req);
        const filter = { userId: requesterUserId };
        if (status && status !== 'all') {
            filter.status = status;
        }

        if (!requesterUserId) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }

        const loans = await Loan.find(filter).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: loans
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener los préstamos del usuario',
            error: error.message
        });
    }
};

export const getLoanById = async (req, res) => {
    try {
        const { id } = req.params;
        const { role: requesterRole, userId: requesterUserId } = getRequesterContext(req);

        const loan = await Loan.findById(id);
        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Prestamo no encontrado'
            });
        }

        if (!ADMINISTRATIVE_ROLES.includes(requesterRole) && String(loan.userId) !== String(requesterUserId)) {
            const idsText = await listOwnLoanIds(requesterUserId);
            return res.status(403).json({
                success: false,
                message: `tus prestamos son idPrestamo: ${idsText}`
            });
        }

        res.status(200).json({
            success: true,
            data: loan
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al buscar el prestamo',
            error: error.message
        });
    }
};

export const updateLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const loanData = { ...req.body };
        const { role: requesterRole, userId: requesterUserId } = getRequesterContext(req);

        const existingLoan = await Loan.findById(id);
        if (!existingLoan) {
            return res.status(404).json({
                success: false,
                message: 'Prestamo no encontrado'
            });
        }

        const isAdministrative = ADMINISTRATIVE_ROLES.includes(requesterRole);

        if (!isAdministrative && String(existingLoan.userId) !== String(requesterUserId)) {
            const idsText = await listOwnLoanIds(requesterUserId);
            return res.status(403).json({
                success: false,
                message: `tus prestamos son idPrestamo: ${idsText}`
            });
        }

        if (!isAdministrative && loanData.status && loanData.status !== existingLoan.status) {
            return res.status(403).json({
                success: false,
                message: 'Solo un usuario administrativo puede cambiar el estado del prestamo'
            });
        }

        validateDisbursedLoanLockedFields(loanData, existingLoan);

        const nextUserId = loanData.userId || existingLoan.userId;
        const nextAccountNumber = loanData.accountNumber || existingLoan.accountNumber;
        const shouldDisburseOnApproval = existingLoan.status === 'solicitado' && loanData.status === 'aprobado';
        const shouldDisburseLegacy = existingLoan.status !== 'desembolsado' && loanData.status === 'desembolsado';
        const shouldDisburse = shouldDisburseOnApproval || shouldDisburseLegacy;

        validateLoanActor({
            requesterRole,
            requesterUserId,
            targetUserId: nextUserId
        });

        await validateExistingUser(nextUserId);
        if (isAdministrative && APPROVAL_STATUSES.includes(loanData.status) && !loanData.approvedByUserId) {
            loanData.approvedByUserId = requesterUserId;
        }

        await validateApproverUser(loanData.approvedByUserId || existingLoan.approvedByUserId);
        const account = await validateAccountOwnershipForLoan({
            accountNumber: nextAccountNumber,
            targetUserId: nextUserId
        });

        if (!isAdministrative) {
            loanData.userId = requesterUserId;
        }

        if (shouldDisburse) {
            if (!isAdministrative) {
                return res.status(403).json({
                    success: false,
                    message: 'Solo un usuario administrativo puede desembolsar prestamos'
                });
            }

            if (shouldDisburseLegacy && existingLoan.status !== 'aprobado') {
                throw new Error('Solo se pueden desembolsar prestamos aprobados');
            }

            if (shouldDisburseOnApproval && existingLoan.status !== 'solicitado') {
                throw new Error('Solo se pueden aprobar y desembolsar prestamos solicitados');
            }

            if (existingLoan.disbursementDepositId || existingLoan.disbursementTransactionId) {
                throw new Error('Este prestamo ya tiene un desembolso registrado');
            }

            await disburseLoanAmount({
                loanId: id,
                loanData,
                existingLoan,
                account,
                executedByUserId: requesterUserId
            });
        }

        const loan = await Loan.findByIdAndUpdate(
            id,
            loanData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Prestamo actualizado exitosamente',
            data: loan
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar el prestamo',
            error: error.message
        });
    }
};

export const deleteLoan = async (req, res) => {
    try {
        const { id } = req.params;
        const loan = await Loan.findByIdAndDelete(id);

        if (!loan) {
            return res.status(404).json({
                success: false,
                message: 'Prestamo no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Prestamo eliminado exitosamente'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar el prestamo',
            error: error.message
        });
    }
};
