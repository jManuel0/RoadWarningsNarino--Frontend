const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface AuthResponse {
  token: string;
}

export const authApi = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error("Credenciales incorrectas");
    return res.json();
  },

  async register(username: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    if (!res.ok) throw new Error("No se pudo registrar");
    return res.json();
  },
};
