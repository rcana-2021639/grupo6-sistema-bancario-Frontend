import axios from 'axios';
import { API_ENDPOINTS, API_URLS, getAuthHeaders } from '../../../shared/config/api';

const API_BASE_URL = import.meta.env.VITE_PRODUCT_SERVICE_URL || API_URLS.PRODUCTS;

// Loans
export const getLoans = async () => {
  const response = await axios.get(`${API_BASE_URL}/loan`, {
    headers: getAuthHeaders(),
  });
  return response.data?.data || [];
};

export const getMyLoans = async () => {
  const response = await axios.get(`${API_BASE_URL}/loan/my`, {
    headers: getAuthHeaders(),
  });
  return response.data?.data || [];
};

export const createLoan = async (loanData) => {
  const response = await axios.post(`${API_BASE_URL}/loan/create`, loanData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const updateLoan = async (loanId, loanData) => {
  const response = await axios.put(`${API_BASE_URL}/loan/${loanId}`, loanData, {
    headers: getAuthHeaders(),
  });
  return response.data;
};

export const getProducts = async () => {
  const response = await axios.get(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.GET_ALL}?status=all&limit=100`, {
    headers: getAuthHeaders(),
  });
  return response.data?.data || [];
};

export const createProduct = async (productData) => {
  const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.CREATE}`, productData, {
    headers: getAuthHeaders(),
  });
  return response.data?.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await axios.put(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.UPDATE(productId)}`, productData, {
    headers: getAuthHeaders(),
  });
  return response.data?.data;
};

export const deleteProduct = async (productId) => {
  const response = await axios.delete(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.DELETE(productId)}`, {
    headers: getAuthHeaders(),
  });
  return response.data?.data;
};

export const purchaseProduct = async (productId, purchaseData) => {
  const response = await axios.post(`${API_BASE_URL}${API_ENDPOINTS.PRODUCTS.PURCHASE(productId)}`, purchaseData, {
    headers: getAuthHeaders(),
  });
  return response.data?.data;
};
