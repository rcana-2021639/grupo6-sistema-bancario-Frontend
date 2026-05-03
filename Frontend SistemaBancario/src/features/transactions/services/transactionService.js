import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';

const parseApiResponse = async (response, fallbackMessage) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || data.error || fallbackMessage);
  }

  return data;
};

const request = async (path, options = {}, fallbackMessage = 'Error en la solicitud') => {
  const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS.BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
  });

  return parseApiResponse(response, fallbackMessage);
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
