// src/stores/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  username: string | null;
  guestMode: boolean;
  setAuth: (token: string, username: string) => void;
  setGuest: (enabled: boolean) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      username: null,
      guestMode: false,

      // Login normal: guarda token y usuario, desactiva modo invitado
      setAuth: (token, username) =>
        set({
          token,
          username,
          guestMode: false,
        }),

      // Activar/desactivar modo invitado
      // Si activo invitado, limpiamos token/username
      setGuest: (enabled: boolean) =>
        set((state) => ({
          guestMode: enabled,
          token: enabled ? null : state.token,
          username: enabled ? null : state.username,
        })),

      // Logout total
      logout: () =>
        set({
          token: null,
          username: null,
          guestMode: false,
        }),

      // Autenticado solo si tiene token (invitado NO cuenta como autenticado)
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "auth-storage",
    }
  )
);
