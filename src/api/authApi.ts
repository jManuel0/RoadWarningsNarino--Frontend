// src/api/authApi.ts

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080/api";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export const authApi = {
  async login(data: LoginRequest): Promise<{ token: string }> {
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

  async register(data: RegisterRequest): Promise<void> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Error registro:", txt);
      throw new Error("Error al registrar usuario");
    }

    // backend devuelve mensaje; no necesitamos leer nada
  },
};

