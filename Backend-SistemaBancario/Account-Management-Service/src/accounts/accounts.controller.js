import Account from './accounts.model.js';
import {
  validateMinimumIncome,
  generateAccountNumber,
  validateUniqueAccountNumber,
  validateAccountHolderData
} from '../../helpers/account.helper.js';
import { User } from '../../../Auth-Service/src/users/user.model.js';
import Currency from '../coins/coins.model.js';
import AccountLock from '../accountLock/accountLock.model.js';
import Transaction from './account-transactions.model.js';

const normalizeCurrencyCode = (accountData) => (
  accountData.currencyCode || accountData.currency || accountData.currencyId || ''
).toUpperCase().trim();

const resolveRequesterUserId = (req) => (
  req.user?.sub || req.user?.userId || req.userId || ''
);

const SENSITIVE_UPDATE_FIELDS = ['accountNumber', 'userId', 'dpi', 'openingDate', 'balance'];

const hasDifferentHolderData = (existingAccount, incomingData) => (
  (incomingData.address !== undefined && String(existingAccount.address) !== String(incomingData.address)) ||
  (incomingData.phone !== undefined && String(existingAccount.phone) !== String(incomingData.phone)) ||
  (incomingData.jobName !== undefined && String(existingAccount.jobName) !== String(incomingData.jobName))
);

const validateExistingCurrencyCode = async (currencyCode) => {
  const currency = await Currency.findOne({ code: currencyCode, status: 'activa' });

  if (!currency) {
    throw new Error(`La moneda ${currencyCode} no existe o esta inactiva`);
  }
};

const validateUserCanOwnAccount = async (userId) => {
  const user = await User.findOne({
    where: { Id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  if (!user.Status) {
    throw new Error('No se puede crear una cuenta para un usuario inactivo o bloqueado');
  }

  return user;
};

const validateAccountCreationRules = async (accountData) => {
  const [accountsByUser, accountsByDpi, sameTypeAccount, activeAccountsWithSameDpi] = await Promise.all([
    Account.countDocuments({ userId: accountData.userId }),
    Account.countDocuments({ dpi: accountData.dpi }),
    Account.findOne({ userId: accountData.userId, accountType: accountData.accountType }),
    Account.find({ dpi: accountData.dpi, status: 'activa' })
  ]);

  if (accountsByUser >= 2) {
    throw new Error('El usuario ya alcanzo el maximo de 2 cuentas');
  }

  if (accountsByDpi >= 2) {
    throw new Error('El DPI ya alcanzo el maximo de 2 cuentas');
  }

  if (sameTypeAccount) {
    throw new Error(`El usuario ya tiene una cuenta de tipo ${accountData.accountType}`);
  }

  const conflictingActiveAccount = activeAccountsWithSameDpi.find((account) => (
    String(account.userId) !== String(accountData.userId) || hasDifferentHolderData(account, accountData)
  ));

  if (conflictingActiveAccount) {
    throw new Error('Ya existe una cuenta activa con este DPI y los datos del titular no coinciden');
  }
};

const validateStatusChangePermissions = (role) => {
  if (role !== 'ADMIN_ROLE') {
    throw new Error('Solo un ADMIN_ROLE puede cambiar el estado de una cuenta');
  }
};

const validateAccountOwnershipOrAdmin = ({ account, requesterRole, requesterUserId }) => {
  if (requesterRole === 'ADMIN_ROLE') {
    return true;
  }

  if (!requesterUserId || String(account.userId) !== String(requesterUserId)) {
    throw new Error('No puedes modificar una cuenta que no te pertenece');
  }

  return true;
};

const validateAccountClosureRules = async (account) => {
  if (Number(account.balance) > 0) {
    throw new Error('No se puede cerrar o eliminar una cuenta con saldo mayor a 0');
  }

  const [pendingTransaction, activeLock] = await Promise.all([
    Transaction.findOne({
      status: 'pendiente',
      $or: [
        { sourceAccountNumber: account.accountNumber },
        { destinationAccountNumber: account.accountNumber }
      ]
    }),
    AccountLock.findOne({
      accountId: account.accountNumber,
      status: 'bloqueado'
    })
  ]);

  if (pendingTransaction) {
    throw new Error('No se puede cerrar o eliminar la cuenta porque tiene transacciones pendientes');
  }

  if (activeLock) {
    throw new Error('No se puede cerrar o eliminar la cuenta porque tiene bloqueos activos');
  }
};

// agregar
export const createAccount = async (req, res) => {
  try {

    const accountData = req.body;
    accountData.currencyCode = normalizeCurrencyCode(accountData);
    await validateExistingCurrencyCode(accountData.currencyCode);
    const user = await validateUserCanOwnAccount(accountData.userId);

    // El nombre y username se obtienen del usuario autenticado/registrado
    accountData.name = user.Name;
    accountData.username = user.Username;

    validateAccountHolderData(accountData);
    validateMinimumIncome(accountData.monthlyIncome);
    await validateAccountCreationRules(accountData);
    accountData.accountNumber = generateAccountNumber();

    let retries = 0;
    const maxRetries = 10;

    while (retries < maxRetries) {
      try {
        await validateUniqueAccountNumber(accountData.accountNumber);
        break;
      } catch (error) {
        if (error.message !== 'El numero de cuenta ya existe') {
          throw error;
        }

        retries += 1;
        accountData.accountNumber = generateAccountNumber();
      }
    }

    if (retries === maxRetries) {
      throw new Error('No se pudo generar un numero de cuenta unico');
    }

    const account = new Account(accountData);
    await account.save();

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      data: account
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAccounts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = 'activa' } = req.query;
    const filter = { status };
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    }

    const accounts = await Account.find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort(options.sort);
    const total = await Account.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: accounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRecords: total,
        limit
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener las cuentas',
      error: error.message
    })
  }
}

export const getMyAccounts = async (req, res) => {
  try {
    const requesterUserId = resolveRequesterUserId(req);

    if (!requesterUserId) {
      return res.status(401).json({
        success: false,
        message: 'Usuario no autenticado'
      });
    }

    const accounts = await Account.find({ userId: requesterUserId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: accounts
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus cuentas',
      error: error.message
    });
  }
};

export const updateAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const accountData = req.body;
    const requesterRole = req.user?.role;

    // resolve the user id from the JWT so we can enforce ownership later
    const requesterUserId = resolveRequesterUserId(req);

    const attemptedSensitiveFields = Object.keys(accountData)
      .filter((field) => SENSITIVE_UPDATE_FIELDS.includes(field));

    if (attemptedSensitiveFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'No se permite modificar campos sensibles de la cuenta',
        blockedFields: attemptedSensitiveFields
      });
    }

    if (accountData.status !== undefined) {
      return res.status(403).json({
        success: false,
        message: 'El estado de la cuenta solo puede cambiarse desde el endpoint de cambio de estado'
      });
    }

    if (requesterRole === 'USER_ROLE') {
      const allowedFieldsForUser = ['name', 'address', 'jobName', 'monthlyIncome'];
      const payloadKeys = Object.keys(accountData);
      const blockedFields = payloadKeys.filter((field) => !allowedFieldsForUser.includes(field));

      if (blockedFields.length > 0) {
        return res.status(403).json({
          success: false,
          message: 'Como USER_ROLE solo puedes editar: name, address, jobName, monthlyIncome',
          blockedFields
        });
      }
    }

    if (accountData.currencyCode || accountData.currency || accountData.currencyId) {
      accountData.currencyCode = normalizeCurrencyCode(accountData);
      await validateExistingCurrencyCode(accountData.currencyCode);
    }

    // username no se actualiza desde cliente
    delete accountData.username;
    delete accountData.status;

    validateAccountHolderData(accountData, { partial: true });

    if (accountData.monthlyIncome !== undefined) {
      validateMinimumIncome(accountData.monthlyIncome);
    }

    // before performing the update we need to ensure that a normal user
    // can only modify their own account.  Admins/managers/atm roles are
    // allowed to update any record as before.
    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    try {
      validateAccountOwnershipOrAdmin({
        account,
        requesterRole,
        requesterUserId
      });
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: error.message
      });
    }

    if (accountData.accountType && accountData.accountType !== account.accountType) {
      const sameTypeAccount = await Account.findOne({
        userId: account.userId,
        accountType: accountData.accountType,
        accountNumber: { $ne: accountNumber }
      });

      if (sameTypeAccount) {
        return res.status(400).json({
          success: false,
          message: `El usuario ya tiene una cuenta de tipo ${accountData.accountType}`
        });
      }
    }

    // perform the update after ownership check
    const updated = await Account.findOneAndUpdate(
      { accountNumber },
      accountData,
      { new: true, runValidators: true }
    );

    // `updated` is guaranteed to exist because we already fetched `account`
    // above and returned early if it didn't.  Still, keep the response
    // structure consistent.
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: updated
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { accountNumber } = req.params;

    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    await validateAccountClosureRules(account);

    await Account.deleteOne({ accountNumber });

    res.status(200).json({
      success: true,
      message: 'Cuenta eliminada'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al eliminar la cuenta',
      error: error.message
    });
  }
};

export const changeAccountStatus = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const { status } = req.body;
    const requesterRole = req.user?.role;

    validateStatusChangePermissions(requesterRole);

    const existingAccount = await Account.findOne({ accountNumber });

    if (!existingAccount) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    if (status === 'inactiva') {
      await validateAccountClosureRules(existingAccount);
    }

    const account = await Account.findOneAndUpdate(
      { accountNumber },
      { status },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Estado actualizado',
      data: account
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

export const getAccountByAccountNumber = async (req, res) => {
  try {
    const { accountNumber } = req.params;
    const requesterRole = req.user?.role;
    const requesterUserId = resolveRequesterUserId(req);

    const account = await Account.findOne({ accountNumber });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    if (requesterRole !== 'ADMIN_ROLE' && String(account.userId) !== String(requesterUserId)) {
      return res.status(403).json({
        success: false,
        message: 'Solo el propietario o un administrador pueden ver esta cuenta'
      });
    }

    res.status(200).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al obtener la cuenta',
      error: error.message
    });
  }
};
