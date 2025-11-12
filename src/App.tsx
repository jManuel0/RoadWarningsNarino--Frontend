// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  guestMode: boolean;
  setAuth: (token: string, username: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
  setGuest: (enabled: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      guestMode: false,

      setAuth: (token, username) =>
        set({ token, username, guestMode: false }),

      logout: () =>
        set({ token: null, username: null, guestMode: false }),

      isAuthenticated: () => !!get().token,

      setGuest: (enabled) => set({ guestMode: enabled }),
    }),
    {
      name: "auth-storage",
    }
  )
);
