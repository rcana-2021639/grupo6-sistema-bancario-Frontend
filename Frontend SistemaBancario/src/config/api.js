// URLs base de los servicios del backend
export const API_URLS = {
  AUTH: 'http://localhost:3005/api/v1',
  ACCOUNTS: 'http://localhost:3008/api/v1',
  TRANSACTIONS: 'http://localhost:3011/api/v1',
  PRODUCTS: 'http://localhost:3009/api/v1',
  REPORTING: 'http://localhost:3010/api/v1',
};

// Endpoints de la API
export const API_ENDPOINTS = {
  ACCOUNTS: {
    BASE_URL: API_URLS.ACCOUNTS,
    GET_ALL: '/accounts',
    GET_BY_ID: (id) => `/accounts/${id}`,
    CREATE: '/accounts',
    UPDATE: (id) => `/accounts/${id}`,
    LOCK: (id) => `/accounts/${id}/lock`,
  },
  TRANSACTIONS: {
    BASE_URL: API_URLS.TRANSACTIONS,
    GET_ALL: '/transactions',
    GET_BY_ID: (id) => `/transactions/${id}`,
  },
  PRODUCTS: {
    BASE_URL: API_URLS.PRODUCTS,
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
  },
  REPORTING: {
    BASE_URL: API_URLS.REPORTING,
    GET_REPORTS: '/reports',
  },
  AUTH: {
    BASE_URL: API_URLS.AUTH,
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
};

// Clave para el token JWT en localStorage
export const TOKEN_KEY = 'sb_token';
export const USER_KEY = 'sb_user';

// Función para obtener headers de autenticación
export const getAuthHeaders = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Monedas disponibles
export const CURRENCIES = {
  GTQ: { symbol: 'Q', name: 'Quetzal Guatemalteco', flag: '🇬🇹' },
  USD: { symbol: '$', name: 'Dólar Estadounidense', flag: '🇺🇸' },
  EUR: { symbol: '€', name: 'Euro', flag: '🇪🇺' },
};

// Estados de cuenta
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
};

// Estados de tarjeta
export const CARD_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  EXPIRED: 'expired',
};

// Tipos de transacción
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  TRANSFER: 'transfer',
  PAYMENT: 'payment',
};