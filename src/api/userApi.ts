import { Alert } from "@/types/Alert";
import { API_BASE } from "./baseUrl";

function getAuthToken(): string | null {
  try {
    const stored = localStorage.getItem("auth-storage");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.state?.token ?? null;
  } catch {
    return null;
  }
}

function authHeaders(json: boolean = false): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export interface UserProfile {
  id: number;
  username: string;
  email?: string;
  createdAt: string;
  alertCount: number;
  resolvedCount: number;
}

export interface UserStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedAlerts: number;
  criticalAlerts: number;
  mostCommonType: string;
}

export const userApi = {
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener perfil");
    }

    return res.json();
  },

  async getUserAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/user/alerts`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas del usuario");
    }

    return res.json();
  },

  async getUserStats(): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/api/user/stats`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadísticas");
    }

    return res.json();
  },

  async updateProfile(data: { email?: string }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/user/profile`, {
      method: "PATCH",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar perfil");
    }

    return res.json();
  },
};
