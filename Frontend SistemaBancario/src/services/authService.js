import axios from 'axios';
import { API_URLS, TOKEN_KEY, USER_KEY } from '../config/api';

const authApi = axios.create({
  baseURL: API_URLS.AUTH,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Iniciar sesión
  login: async (emailOrUsername, password) => {
    const response = await authApi.post('/auth/login', { emailOrUsername, password });
    if (response.data.token) {
      localStorage.setItem(TOKEN_KEY, response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.userDetails));
    }
    return response.data;
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

  // Cerrar sesión
  logout: () => {
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
