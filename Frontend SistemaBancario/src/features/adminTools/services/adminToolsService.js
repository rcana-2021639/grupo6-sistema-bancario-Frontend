import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';
import { normalizeApiError, parseFetchResponse } from '../../../shared/utils/apiError';

const request = async (baseUrl, path, options = {}, fallbackMessage = 'Error en la solicitud') => {
  try {
    const response = await fetch(`${baseUrl}${path}`, {
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

const coinRequest = (path, options, message) => request(API_ENDPOINTS.COINS.BASE_URL, path, options, message);
const lockRequest = (path, options, message) => request(API_ENDPOINTS.ACCOUNT_LOCKS.BASE_URL, path, options, message);

export const getCurrencies = async ({ status = 'activa', limit = 100 } = {}) => {
  const params = new URLSearchParams({ status, limit: String(limit) });
  const data = await coinRequest(`${API_ENDPOINTS.COINS.GET_ALL}?${params}`, { method: 'GET' }, 'Error al obtener monedas');
  return data.data || [];
};

export const createCurrency = async (currencyData) => {
  const data = await coinRequest(API_ENDPOINTS.COINS.CREATE, {
    method: 'POST',
    body: JSON.stringify(currencyData),
  }, 'Error al crear moneda');
  return data.data;
};

export const updateCurrency = async (currencyId, currencyData) => {
  const data = await coinRequest(API_ENDPOINTS.COINS.UPDATE(currencyId), {
    method: 'PUT',
    body: JSON.stringify(currencyData),
  }, 'Error al actualizar moneda');
  return data.data;
};

export const changeCurrencyStatus = async (currencyId, status) => {
  const data = await coinRequest(API_ENDPOINTS.COINS.STATUS(currencyId), {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }, 'Error al cambiar estado de moneda');
  return data.data;
};

export const deleteCurrency = async (currencyId) => {
  const data = await coinRequest(API_ENDPOINTS.COINS.DELETE(currencyId), { method: 'DELETE' }, 'Error al eliminar moneda');
  return data;
};

export const getAccountLocks = async ({ status = 'bloqueado', limit = 100 } = {}) => {
  const params = new URLSearchParams({ status, limit: String(limit) });
  const data = await lockRequest(`${API_ENDPOINTS.ACCOUNT_LOCKS.GET_ALL}?${params}`, { method: 'GET' }, 'Error al obtener bloqueos');
  return data.data || [];
};

export const createAccountLock = async (lockData) => {
  const data = await lockRequest(API_ENDPOINTS.ACCOUNT_LOCKS.CREATE, {
    method: 'POST',
    body: JSON.stringify(lockData),
  }, 'Error al crear bloqueo');
  return data.data;
};

export const updateAccountLock = async (lockId, lockData) => {
  const data = await lockRequest(API_ENDPOINTS.ACCOUNT_LOCKS.UPDATE(lockId), {
    method: 'PUT',
    body: JSON.stringify(lockData),
  }, 'Error al actualizar bloqueo');
  return data.data;
};

export const deleteAccountLock = async (lockId) => {
  const data = await lockRequest(API_ENDPOINTS.ACCOUNT_LOCKS.DELETE(lockId), { method: 'DELETE' }, 'Error al eliminar bloqueo');
  return data;
};
