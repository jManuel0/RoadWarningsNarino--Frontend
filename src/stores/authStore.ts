import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  guestMode: boolean;
  setAuth: (token: string, username: string) => void;
  setGuest: () => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      guestMode: false,

      setAuth: (token, username) =>
        set({ token, username, guestMode: false }),

      setGuest: () =>
        set({ token: null, username: null, guestMode: true }),

      logout: () =>
        set({ token: null, username: null, guestMode: false }),

      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
    }
  )
);
