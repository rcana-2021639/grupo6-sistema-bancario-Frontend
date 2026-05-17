import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';
import { normalizeApiError, parseFetchResponse } from '../../../shared/utils/apiError';

const request = async (path, options = {}, fallbackMessage = 'Error en la solicitud') => {
  try {
    const response = await fetch(`${API_ENDPOINTS.ACCOUNTS.BASE_URL}${path}`, {
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

export const getAccountsByStatus = async (status = 'activa') => {
  const params = new URLSearchParams({ status, limit: '100' });
  const data = await request(
    `${API_ENDPOINTS.ACCOUNTS.GET_ALL}?${params}`,
    { method: 'GET' },
    'Error al obtener las cuentas',
  );

  return data.data || [];
};

export const getAllAccounts = async () => {
  const statuses = ['activa', 'inactiva', 'bloqueada'];
  const settled = await Promise.allSettled(statuses.map((status) => getAccountsByStatus(status)));
  const accounts = settled.flatMap((result) => (result.status === 'fulfilled' ? result.value : []));

  if (!accounts.length) {
    const failed = settled.find((result) => result.status === 'rejected');
    if (failed) throw failed.reason;
  }

  return accounts;
};

export const getMyAccounts = async () => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.GET_ME,
    { method: 'GET' },
    'Error al obtener tus cuentas',
  );

  return data.data || [];
};

export const getAccountByAccountNumber = async (accountNumber) => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.GET_BY_ID(accountNumber),
    { method: 'GET' },
    'Error al obtener la cuenta',
  );

  return data.data;
};

export const createAccount = async (accountData) => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.CREATE,
    {
      method: 'POST',
      body: JSON.stringify(accountData),
    },
    'Error al crear la cuenta',
  );

  return data.data;
};

export const updateAccount = async (accountNumber, accountData) => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.UPDATE(accountNumber),
    {
      method: 'PUT',
      body: JSON.stringify(accountData),
    },
    'Error al actualizar la cuenta',
  );

  return data.data;
};

export const deleteAccount = async (accountNumber) => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.DELETE(accountNumber),
    { method: 'DELETE' },
    'Error al eliminar la cuenta',
  );

  return data;
};

export const changeAccountStatus = async (accountNumber, status) => {
  const data = await request(
    API_ENDPOINTS.ACCOUNTS.STATUS(accountNumber),
    {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    },
    'Error al cambiar el estado de la cuenta',
  );

  return data.data;
};

export const searchAccountsByDpi = async (dpi) => {
  const accounts = await getAllAccounts();
  return accounts.filter((account) => String(account.dpi || '').includes(String(dpi).trim()));
};

export const lockAccount = async (accountNumber, isLocked) => (
  changeAccountStatus(accountNumber, isLocked ? 'bloqueada' : 'activa')
);
