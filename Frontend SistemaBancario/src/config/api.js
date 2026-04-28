/**
 * Configuración centralizada de endpoints de API
 */

// URLs base para cada servicio
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const API_ENDPOINTS = {
    // Auth Service (Puerto 3005)
    AUTH: {
        BASE_URL: `${API_BASE_URL}:3005/api/v1`,
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        VERIFY_EMAIL: '/auth/verify-email',
        RESEND_VERIFICATION: '/auth/resend-verification',
        FORGOT_PASSWORD: '/auth/forgot-password',
        RESET_PASSWORD: '/auth/reset-password',
        PROFILE: '/users/profile',
    },

    // Account Management Service (Puerto 3008)
    ACCOUNTS: {
        BASE_URL: `${API_BASE_URL}:3008/api/v1`,
        GET_ALL: '/accounts',
        GET_BY_ID: (id) => `/accounts/${id}`,
        CREATE: '/accounts',
        UPDATE: (id) => `/accounts/${id}`,
        LOCK: (id) => `/accounts/${id}/lock`,
    },

    // Product Management Service (Puerto 3007)
    PRODUCTS: {
        BASE_URL: `${API_BASE_URL}:3007/api/v1`,
        GET_ALL: '/products',
        GET_BY_ID: (id) => `/products/${id}`,
        CREATE: '/products',
        UPDATE: (id) => `/products/${id}`,
    },

    // Transaction Processing Service (Puerto 3006)
    TRANSACTIONS: {
        BASE_URL: `${API_BASE_URL}:3006/api/v1`,
        GET_ALL: '/transactions',
        GET_BY_ID: (id) => `/transactions/${id}`,
        CREATE: '/transactions',
    },

    // Reporting Analytics Service (Puerto 3009)
    REPORTING: {
        BASE_URL: `${API_BASE_URL}:3009/api/v1`,
        GET_REPORTS: '/reports',
        GET_ANALYTICS: '/analytics',
    },
};

/**
 * Obtener headers con autenticación
 * @returns {Object} Headers con token
 */
export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

/**
 * Realizar request a la API
 * @param {string} url - URL del endpoint
 * @param {Object} options - Opciones del fetch
 * @returns {Promise<Object>} Respuesta de la API
 */
export const apiCall = async (url, options = {}) => {
    const defaultOptions = {
        headers: getAuthHeaders(),
        ...options,
    };

    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud a la API');
    }

    return data;
};