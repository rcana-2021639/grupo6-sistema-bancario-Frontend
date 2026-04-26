import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginService, register as registerService } from '../services/authService';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (token && savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    return null;
  });
  const navigate = useNavigate();

  const login = useCallback(async (emailOrUsername, password) => {
    console.log('[Auth] Intentando login con:', { emailOrUsername });
    const data = await loginService(emailOrUsername, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.userDetails));
    setUser(data.userDetails);
    console.log('[Auth] Login exitoso para:', data.userDetails.username);
    return data;
  }, []);

  const register = useCallback(async (userData) => {
    const data = await registerService(userData);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  }, [navigate]);

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};