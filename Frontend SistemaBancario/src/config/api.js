// URLs base de los servicios del backend
export const API_URLS = {
  AUTH: 'http://localhost:3005/api/v1',
  ACCOUNTS: 'http://localhost:3008/api/v1',
  TRANSACTIONS: 'http://localhost:3011/api/v1',
  PRODUCTS: 'http://localhost:3009/api/v1',
  REPORTING: 'http://localhost:3010/api/v1',
};

// Clave para el token JWT en localStorage
export const TOKEN_KEY = 'sb_token';
export const USER_KEY = 'sb_user';

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