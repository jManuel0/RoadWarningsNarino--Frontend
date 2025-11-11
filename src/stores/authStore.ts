import { create } from "zustand";
import { authApi } from "@/api/authApi";

interface AuthState {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window === "undefined" ? null : localStorage.getItem("token"),
  username: typeof window === "undefined" ? null : localStorage.getItem("username"),

  async login(username, password) {
    const res = await authApi.login(username, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", username);
    set({ token: res.token, username });
  },

  async register(username, email, password) {
    const res = await authApi.register(username, email, password);
    localStorage.setItem("token", res.token);
    localStorage.setItem("username", username);
    set({ token: res.token, username });
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    set({ token: null, username: null });
  },
}));
