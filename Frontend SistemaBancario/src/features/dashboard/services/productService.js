import axios from 'axios';
import { API_URLS, getAuthHeaders } from '../../../shared/config/api';

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

// Placeholder for other products if needed
export const getProducts = async () => {
  // Implement if needed
  return [];
};