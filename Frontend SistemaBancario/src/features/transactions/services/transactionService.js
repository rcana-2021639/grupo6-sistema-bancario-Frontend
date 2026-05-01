import { API_ENDPOINTS, getAuthHeaders } from '../../../shared/config/api';

export const getRecentTransactions = async () => {
  const params = new URLSearchParams({ status: 'exitosa', limit: '5' });
  const response = await fetch(`${API_ENDPOINTS.TRANSACTIONS.BASE_URL}${API_ENDPOINTS.TRANSACTIONS.GET_ALL}?${params}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Error al obtener las transacciones');
  }

  return data.data || [];
};
