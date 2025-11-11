// src/api/authApi.ts
const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error login:", text);
      throw new Error("Credenciales inválidas");
    }

    return res.json();
  },

  async register(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error register:", text);
      throw new Error("No se pudo registrar");
    }
  },
};

