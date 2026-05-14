import axios from 'axios';
import { API_ENDPOINTS, API_URLS, getAuthHeaders } from '../../../shared/config/api';
import { normalizeApiError } from '../../../shared/utils/apiError';

const API_BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || API_URLS.PRODUCTS;

const unwrap = async (requestPromise, fallbackMessage) => {
  try {
    return await requestPromise;
  } catch (error) {
    throw normalizeApiError(error, fallbackMessage);
  }
};

// Loans
export const getLoans = async () => {
  const response = await unwrap(axios.get(`${API_BASE_URL}/loan`, {
    headers: getAuthHeaders(),
  }), 'Error al obtener prestamos');
  return response.data?.data || [];
};

export const getMyLoans = async () => {
  const response = await unwrap(axios.get(`${API_BASE_URL}/loan/my`, {
    headers: getAuthHeaders(),
  }), 'Error al obtener tus prestamos');
  return response.data?.data || [];
};

export const createLoan = async (loanData) => {
  const response = await unwrap(axios.post(`${API_BASE_URL}/loan/create`, loanData, {
    headers: getAuthHeaders(),
  }), 'Error al crear el prestamo');
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await unwrap(axios.put(`${API_BASE_URL}/loan/${loanId}`, loanData, {
    headers: getAuthHeaders(),
  }), 'Error al actualizar el prestamo');
  return response.data;
};

export const getProducts = async () => {
  const response = await unwrap(axios.get(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.GET_ALL}?status=all&limit=100`, {
    headers: getAuthHeaders(),
  }), 'Error al obtener productos');
  return response.data?.data || [];
};

export const createProduct = async (productData) => {
  const response = await unwrap(axios.post(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.CREATE}`, productData, {
    headers: getAuthHeaders(),
  }), 'Error al crear el producto');
  return response.data?.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await unwrap(axios.put(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.UPDATE(productId)}`, productData, {
    headers: getAuthHeaders(),
  }), 'Error al actualizar el producto');
  return response.data?.data;
};

export const deleteProduct = async (productId) => {
  const response = await unwrap(axios.delete(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.DELETE(productId)}`, {
    headers: getAuthHeaders(),
  }), 'Error al eliminar el producto');
  return response.data?.data;
};

export const purchaseProduct = async (productId, purchaseData) => {
  const response = await unwrap(axios.post(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.PURCHASE(productId)}`, purchaseData, {
    headers: getAuthHeaders(),
  }), 'Error al comprar el producto');
  return response.data?.data;
};
