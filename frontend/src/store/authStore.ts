import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Business } from "../types/api.js";
import { authApi, LoginPayload, RegisterPayload } from "../api/auth.js";

interface AuthState {
  user: User | null;
  business: Business | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  setAuth: (user: User, business: Business, accessToken: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  updateBusiness: (business: Partial<Business>) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload & { monthlyBudgetPaise?: number }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      business: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setAuth: (user, business, accessToken, refreshToken) => {
        set({
          user,
          business,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          error: null,
        });
      },

      updateUser: (partialUser) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...partialUser } : null,
        }));
      },

      updateBusiness: (partialBusiness) => {
        set((state) => ({
          business: state.business ? { ...state.business, ...partialBusiness } : null,
        }));
      },

      clearError: () => set({ error: null }),

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.login({ email, password });
          set({
            user: res.user,
            business: res.business,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
              ?.error?.message ||
            (err instanceof Error ? err.message : "Authentication failed");
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authApi.register(payload);
          set({
            user: res.user,
            business: res.business,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data
              ?.error?.message ||
            (err instanceof Error ? err.message : "Registration failed");
          set({ isLoading: false, error: message });
          throw err;
        }
      },

      logout: () => {
        try {
          authApi.logout().catch(() => {});
        } catch {}
        set({
          user: null,
          business: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          error: null,
        });
      },
    }),
    {
      name: "procurepilot-auth",
      partialize: (state) => ({
        user: state.user,
        business: state.business,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
