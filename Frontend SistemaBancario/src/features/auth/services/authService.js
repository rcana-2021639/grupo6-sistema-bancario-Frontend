import axios from 'axios';
import { API_ENDPOINTS, API_URLS, TOKEN_KEY, USER_KEY } from '../../../shared/config/api';
import { normalizeApiError } from '../../../shared/utils/apiError';

const authApi = axios.create({
  baseURL: API_URLS.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

const READ_CACHE_TTL = 30 * 1000;
const readCache = new Map();
let activeLoginRequest = null;
let activeLoginKey = '';

const getCached = (key, loader, ttl = READ_CACHE_TTL) => {
  const now = Date.now();
  const cached = readCache.get(key);

  if (cached?.data && cached.expiresAt > now) {
    return Promise.resolve(cached.data);
  }

  if (cached?.promise) {
    return cached.promise;
  }

  const promise = loader()
    .then((data) => {
      readCache.set(key, { data, expiresAt: Date.now() + ttl });
      return data;
    })
    .catch((error) => {
      readCache.delete(key);
      throw error;
    });

  readCache.set(key, { promise, expiresAt: 0 });
  return promise;
};

const clearUsersCache = () => {
  [...readCache.keys()]
    .filter((key) => key.startsWith('users:'))
    .forEach((key) => readCache.delete(key));
};

// Interceptor para agregar el token a las peticiones
authApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores de autenticación
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config && error.config.url && error.config.url.includes('/auth/login');
    const errorCode = error.response?.data?.error;
    const errorMessage = String(error.response?.data?.message || '');
    const isAuthTokenFailure = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'MISSING_TOKEN'].includes(errorCode)
      || /token expirado|token invalido|token no valido|no hay token/i.test(errorMessage);
    
    if (error.response?.status === 401 && !isLoginRequest && isAuthTokenFailure) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/';
    }
    return Promise.reject(normalizeApiError(error, 'Error de autenticacion'));
  }
);

export const authService = {
  // Iniciar sesión
  login: async (emailOrUsername, password) => {
    const loginKey = `${emailOrUsername}:${password}`;
    if (activeLoginRequest && activeLoginKey === loginKey) {
      return activeLoginRequest;
    }

    activeLoginKey = loginKey;
    activeLoginRequest = authApi.post('/auth/login', { emailOrUsername, password })
      .then((response) => {
        readCache.clear();
        if (response.data.token) {
          localStorage.setItem(TOKEN_KEY, response.data.token);
          localStorage.setItem(USER_KEY, JSON.stringify(response.data.userDetails));
        }
        return response.data;
      })
      .finally(() => {
        activeLoginRequest = null;
        activeLoginKey = '';
      });

    return activeLoginRequest;
  },

  // Registrar usuario
  register: async (userData) => {
    const response = await authApi.post('/auth/register', userData);
    return response.data;
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await authApi.get('/auth/profile');
    return response.data;
  },

  getUsersByRole: async (roleName) => {
    const normalizedRole = String(roleName || '').trim().toUpperCase();
    return getCached(`users:role:${normalizedRole}`, async () => {
      const response = await authApi.get(API_ENDPOINTS.USERS.GET_BY_ROLE(normalizedRole));
      return response.data;
    });
  },

  getAdministrativeUsers: async () => {
    return getCached('users:administrative', async () => {
      const response = await authApi.get(API_ENDPOINTS.USERS.GET_ADMINISTRATIVE);
      return response.data;
    });
  },

  createAdministrativeUser: async (userData) => {
    const response = await authApi.post(API_ENDPOINTS.USERS.CREATE_ADMINISTRATIVE, userData);
    clearUsersCache();
    return response.data;
  },

  createClientUser: async (userData) => {
    const response = await authApi.post(API_ENDPOINTS.USERS.CREATE_CLIENT, userData);
    clearUsersCache();
    return response.data;
  },

  updateAdministrativeUser: async (userId, userData) => {
    const response = await authApi.put(API_ENDPOINTS.USERS.UPDATE(userId), userData);
    clearUsersCache();
    return response.data;
  },

  changeAdministrativeUserStatus: async (userId, status) => {
    const response = await authApi.put(API_ENDPOINTS.USERS.STATUS(userId), { status });
    clearUsersCache();
    return response.data;
  },

  deleteAdministrativeUser: async (userId) => {
    const response = await authApi.delete(API_ENDPOINTS.USERS.DELETE(userId));
    clearUsersCache();
    return response.data;
  },

  // Verificar email
  verifyEmail: async (token) => {
    const response = await authApi.post('/auth/verify-email', { token });
    return response.data;
  },

  // Solicitar restablecimiento de contraseña
  forgotPassword: async (email) => {
    const response = await authApi.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Restablecer contraseña
  resetPassword: async (token, newPassword) => {
    const response = await authApi.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (profileData) => {
    const response = await authApi.put('/auth/profile', profileData);
    return response.data;
  },

  // Cambiar contraseña
  changePassword: async (currentPassword, newPassword) => {
    const response = await authApi.put('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  },

  verifyPassword: async (password) => {
    const response = await authApi.post('/auth/verify-password', { password });
    return response.data;
  },

  // Subir foto de perfil
  uploadProfilePicture: async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    const response = await authApi.put('/auth/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Cerrar sesión
  resetProfilePicture: async () => {
    const response = await authApi.delete('/auth/profile-picture');
    return response.data;
  },

  logout: () => {
    readCache.clear();
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Verificar si está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  // Obtener usuario del localStorage
  getCurrentUser: () => {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  // Obtener token
  getToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
