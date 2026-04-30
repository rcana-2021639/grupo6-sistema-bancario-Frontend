import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';

/**
 * Obtener todas las cuentas del usuario autenticado
 * @returns {Promise<Object>} Lista de cuentas
 */
export const getAllAccounts = async () => {
  const url = `${API_ENDPOINTS.ACCOUNTS.BASE_URL}${API_ENDPOINTS.ACCOUNTS.GET_ALL}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al obtener las cuentas');
  }

  return data.data || [];
};

/**
 * Obtener cuenta por ID
 * @param {string} accountId - ID de la cuenta
 * @returns {Promise<Object>} Datos de la cuenta
 */
export const getAccountById = async (accountId) => {
  const url = `${API_ENDPOINTS.ACCOUNTS.BASE_URL}${API_ENDPOINTS.ACCOUNTS.GET_BY_ID(accountId)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al obtener la cuenta');
  }

  return data.data;
};

/**
 * Crear nueva cuenta
 * @param {Object} accountData - Datos de la cuenta
 * @returns {Promise<Object>} Cuenta creada
 */
export const createAccount = async (accountData) => {
  const url = `${API_ENDPOINTS.ACCOUNTS.BASE_URL}${API_ENDPOINTS.ACCOUNTS.CREATE}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al crear la cuenta');
  }

  return data.data;
};

/**
 * Actualizar cuenta
 * @param {string} accountId - ID de la cuenta
 * @param {Object} accountData - Datos a actualizar
 * @returns {Promise<Object>} Cuenta actualizada
 */
export const updateAccount = async (accountId, accountData) => {
  const url = `${API_ENDPOINTS.ACCOUNTS.BASE_URL}${API_ENDPOINTS.ACCOUNTS.UPDATE(accountId)}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(accountData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al actualizar la cuenta');
  }

  return data.data;
};

/**
 * Bloquear/Desbloquear cuenta
 * @param {string} accountId - ID de la cuenta
 * @param {boolean} isLocked - Estado de bloqueo
 * @returns {Promise<Object>} Resultado de la operación
 */
export const lockAccount = async (accountId, isLocked) => {
  const url = `${API_ENDPOINTS.ACCOUNTS.BASE_URL}${API_ENDPOINTS.ACCOUNTS.LOCK(accountId)}`;

  const response = await fetch(url, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ isLocked }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al bloquear/desbloquear la cuenta');
  }

  return data.data;
};
