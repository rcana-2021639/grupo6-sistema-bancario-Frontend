import axios from 'axios';
import { API_ENDPOINTS, API_URLS, getAuthHeaders } from '../../../shared/config/api';
import { normalizeApiError } from '../../../shared/utils/apiError';

const API_BASE_URL = import.meta.env.VITE_REPORTING_SERVICE_URL || API_URLS.REPORTING;

const unwrap = async (requestPromise, fallbackMessage) => {
  try {
    return await requestPromise;
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
};

export const getAccountStatements = async ({ accountNumber = '', page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (accountNumber) params.set('accountNumber', accountNumber);

  const response = await unwrap(axios.get(`${API_BASE_URL}${API_ENDPOINTS.REPORTING.GET_STATEMENTS}?${params}`, {
    headers: getAuthHeaders(),
  }), 'Error al obtener estados de cuenta');

  return {
    statements: response.data?.data || [],
    pagination: response.data?.pagination || null,
  };
};

export const requestAccountStatementPdf = async (accountNumber) => {
  const response = await unwrap(axios.get(`${API_BASE_URL}${API_ENDPOINTS.REPORTING.GET_ACCOUNT_PDF(accountNumber)}`, {
    headers: getAuthHeaders(),
  }), 'Error al solicitar PDF');

  return response.data;
};
