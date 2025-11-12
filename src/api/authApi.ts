import { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ?? "https://roadwarningsnarino-backend.onrender.com/api";

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al iniciar sesión");
    }

    return res.json();
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al registrar usuario");
    }

    return res.json();
  },
};
