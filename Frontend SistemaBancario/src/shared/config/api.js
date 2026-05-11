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
    GET_ME: '/accounts/me',
    GET_BY_ID: (id) => `/accounts/${id}`,
    CREATE: '/accounts/create',
    UPDATE: (id) => `/accounts/${id}`,
    DELETE: (id) => `/accounts/${id}`,
    STATUS: (id) => `/accounts/${id}/status`,
  },
  TRANSACTIONS: {
    BASE_URL: API_URLS.TRANSACTIONS,
    GET_ALL: '/transaction',
    CREATE: '/transaction/create',
    GET_BY_ID: (id) => `/transaction/${id}`,
    DEPOSIT_CREATE: '/deposits/create',
    WITHDRAWAL_CREATE: '/withdrawal',
  },
  PRODUCTS: {
    BASE_URL: API_URLS.PRODUCTS,
    GET_ALL: '/products',
    GET_BY_ID: (id) => `/products/${id}`,
  },
  CARDS: {
    BASE_URL: API_URLS.PRODUCTS,
    GET_ALL: '/cards',
    GET_BY_ID: (id) => `/cards/${id}`,
    CREATE: '/cards/create',
    UPDATE: (id) => `/cards/${id}`,
    DELETE: (id) => `/cards/${id}`,
    STATUS: (id) => `/cards/${id}/status`,
    TOGGLE_STATUS: (id) => `/cards/${id}/toggle-status`,
    SET_LIMIT: (id) => `/cards/${id}/limit`,
    CHANGE_PIN: (id) => `/cards/${id}/pin`,
    GET_MOVEMENTS: (id) => `/cards/${id}/movements`,
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
  USERS: {
    BASE_URL: API_URLS.AUTH,
    CREATE_ADMINISTRATIVE: '/users/administrative',
    GET_BY_ROLE: (roleName) => `/users/by-role/${roleName}`,
    UPDATE: (userId) => `/users/${userId}`,
    STATUS: (userId) => `/users/${userId}/status`,
    DELETE: (userId) => `/users/${userId}`,
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
  ACTIVE: 'activa',
  INACTIVE: 'inactiva',
  BLOCKED: 'bloqueada',
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
