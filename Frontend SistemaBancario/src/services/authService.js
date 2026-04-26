const API_URL = 'http://localhost:3005/api/v1';

/**
 * Iniciar sesión
 * @param {string} emailOrUsername - Email o nombre de usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>} Datos del usuario y token
 */
export const login = async (emailOrUsername, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emailOrUsername, password }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    const errorMessages = {
      'Credenciales inválidas': 'Email/usuario o contraseña incorrectos',
      'Debes verificar tu email': 'Por favor verifica tu correo antes de iniciar sesión',
      'Tu cuenta está desactivada': 'Tu cuenta ha sido desactivada',
    };
    throw new Error(errorMessages[data.message] || data.message || 'Error en la autenticación');
  }

  return data;
};

/**
 * Registrar nuevo usuario
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} Usuario registrado
 */
export const register = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error en el registro');
  }

  return data;
};

/**
 * Verificar email con token
 * @param {string} token - Token de verificación
 * @returns {Promise<Object>} Resultado de la verificación
 */
export const verifyEmail = async (token) => {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al verificar el email');
  }

  return data;
};

/**
 * Reenviar email de verificación
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Resultado del reenvío
 */
export const resendVerification = async (email) => {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al reenviar el email');
  }

  return data;
};

/**
 * Solicitar recuperación de contraseña
 * @param {string} email - Email del usuario
 * @returns {Promise<Object>} Resultado de la solicitud
 */
export const forgotPassword = async (email) => {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error en la solicitud');
  }

  return data;
};

/**
 * Resetear contraseña
 * @param {string} token - Token de reseteo
 * @param {string} newPassword - Nueva contraseña
 * @returns {Promise<Object>} Resultado del reseteo
 */
export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al resetear la contraseña');
  }

  return data;
};

/**
 * Obtener perfil del usuario autenticado
 * @param {string} token - Token JWT
 * @returns {Promise<Object>} Perfil del usuario
 */
export const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Error al obtener el perfil');
  }

  return data;
};