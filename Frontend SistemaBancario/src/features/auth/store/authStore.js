import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set) => ({
  user: authService.getCurrentUser(),
  isAuthenticated: authService.isAuthenticated(),
  role: authService.getCurrentUser()?.role || null, // 'ADMIN_ROLE' o 'USER_ROLE'
  loading: false,
  error: null,

  login: async (emailOrUsername, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(emailOrUsername, password);
      const userDetails = response.userDetails || authService.getCurrentUser();
      set({ 
        user: userDetails, 
        isAuthenticated: true, 
        role: userDetails?.role || 'USER_ROLE', 
        loading: false 
      });
      return userDetails;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register(userData);
      set({ loading: false });
      return response;
    } catch (error) {
      set({ error: error.response?.data?.message || error.message, loading: false });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({ user: null, isAuthenticated: false, role: null });
  }
}));
