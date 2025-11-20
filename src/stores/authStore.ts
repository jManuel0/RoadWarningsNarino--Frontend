import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  username: string | null;
  tokenExpiry: number | null;
  setAuth: (
    token: string,
    username: string,
    refreshToken?: string,
    expiresIn?: number
  ) => void;
  setToken: (token: string, expiresIn?: number) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  isTokenExpired: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      refreshToken: null,
      username: null,
      tokenExpiry: null,

      setAuth: (token, username, refreshToken, expiresIn) => {
        const expiry = expiresIn
          ? Date.now() + expiresIn * 1000
          : Date.now() + 24 * 60 * 60 * 1000; // Default 24h

        set({
          token,
          username,
          refreshToken: refreshToken || null,
          tokenExpiry: expiry,
        });
      },

      setToken: (token, expiresIn) => {
        const expiry = expiresIn
          ? Date.now() + expiresIn * 1000
          : Date.now() + 24 * 60 * 60 * 1000;

        set({ token, tokenExpiry: expiry });
      },

      logout: () =>
        set({
          token: null,
          refreshToken: null,
          username: null,
          tokenExpiry: null,
        }),

      isAuthenticated: () => {
        const state = get();
        return !!state.token && !state.isTokenExpired();
      },

      isTokenExpired: () => {
        const expiry = get().tokenExpiry;
        if (!expiry) return true;
        return Date.now() >= expiry;
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
