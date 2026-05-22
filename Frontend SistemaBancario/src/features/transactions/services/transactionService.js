import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';
import { normalizeApiError, parseFetchResponse } from '../../../shared/utils/apiError';

const request = async (path, options = {}, fallbackMessage = 'Error en la solicitud') => {
  try {
    const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS.BASE_URL}${path}`, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
      },
    });

    return parseFetchResponse(response, fallbackMessage);
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
};

export const getRecentTransactions = async () => {
  const params = new URLSearchParams({ status: 'exitosa', limit: '5' });
  const data = await request(
    `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}?${params}`,
    { method: 'GET' },
    'Error al obtener las transacciones',
  );

  return data.data || [];
};

export const getTransactions = async ({ page = 1, limit = 25, status = 'exitosa' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });
  const data = await request(
    `${API_ENDPOINTS.TRANSACTIONS.GET_ALL}?${params}`,
    { method: 'GET' },
    'Error al obtener las transacciones',
  );

  return {
    transactions: data.data || [],
    pagination: data.pagination || null,
  };
};

export const getFavorites = async () => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.GET_FAVORITES,
    { method: 'GET' },
    'Error al obtener favoritos',
  );

  return data.data || [];
};

export const getDeposits = async ({ page = 1, limit = 25, status = 'exitosa', accountNumber = '' } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    status,
  });
  if (accountNumber) params.set('accountNumber', accountNumber);
  const data = await request(
    `${API_ENDPOINTS.TRANSACTIONS.DEPOSIT_GET_ALL}?${params}`,
    { method: 'GET' },
    'Error al obtener depositos',
  );

  return {
    deposits: data.data || [],
    pagination: data.pagination || null,
  };
};

export const createDeposit = async (depositData) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.DEPOSIT_CREATE,
    {
      method: 'POST',
      body: JSON.stringify(depositData),
    },
    'Error al crear el deposito',
  );

  return data.data;
};

export const updateDepositAmount = async (depositId, amount) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.DEPOSIT_UPDATE(depositId),
    {
      method: 'PUT',
      body: JSON.stringify({ amount: Number(amount) }),
    },
    'Error al actualizar el deposito',
  );

  return data.data;
};

export const revertDeposit = async (depositId) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.DEPOSIT_REVERT(depositId),
    { method: 'PATCH' },
    'Error al revertir el deposito',
  );

  return data.data;
};

export const createWithdrawal = async (withdrawalData) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.WITHDRAWAL_CREATE,
    {
      method: 'POST',
      body: JSON.stringify(withdrawalData),
    },
    'Error al crear el retiro',
  );

  return data.withdrawal || data.data;
};

export const createTransfer = async (transferData) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.CREATE,
    {
      method: 'POST',
      body: JSON.stringify({
        ...transferData,
        transactionType: 'transferencia',
      }),
    },
    'Error al crear la transferencia',
  );

  return data.data;
};

export const getTransactionById = async (transactionId) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.GET_BY_ID(transactionId),
    { method: 'GET' },
    'Error al obtener la transaccion',
  );

  return data.data;
};

export const updateTransaction = async (transactionId, transactionData) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.UPDATE(transactionId),
    {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    },
    'Error al actualizar la transaccion',
  );

  return data.data;
};

export const cancelTransaction = async (transactionId, payload = {}) => {
  const data = await request(
    API_ENDPOINTS.TRANSACTIONS.DELETE(transactionId),
    {
      method: 'DELETE',
      body: JSON.stringify(payload),
    },
    'Error al cancelar la transaccion',
  );

  return data.data;
};

export const convertCurrency = async ({ amount, from, to }) => {
  const params = new URLSearchParams({
    amount: String(amount),
    from,
    to,
  });
  const data = await request(
    `${API_ENDPOINTS.TRANSACTIONS.CONVERT}?${params}`,
    { method: 'GET' },
    'Error al convertir divisas',
  );

  return data.data;
};
