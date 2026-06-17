import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../api/client.js';
import type { User, LoginRequest } from '../../shared/types.js';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.auth.login(credentials);
          api.setToken(response.token);
          set({ 
            user: response.user, 
            token: response.token, 
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : '登录失败', 
            isLoading: false 
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.auth.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          api.removeToken();
          set({ user: null, token: null });
        }
      },

      fetchCurrentUser: async () => {
        set({ isLoading: true });
        try {
          const user = await api.auth.getCurrentUser();
          set({ user, isLoading: false });
        } catch (error) {
          api.removeToken();
          set({ 
            user: null, 
            token: null, 
            error: error instanceof Error ? error.message : '获取用户信息失败',
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
