import { Alert } from "@/types/Alert";
import { API_BASE } from "@/api/baseUrl";

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

function buildQuery(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.append(key, String(value));
  }

  const query = search.toString();
  return query ? `?${query}` : "";
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

export interface UserBadge {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  earnedAt?: string;
}

export interface UserLevelProgress {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  progressPercentage?: number;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface ResetPasswordRequestDTO {
  token: string;
  newPassword: string;
}

export interface UserPaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | "ASC" | "DESC";
  [key: string]: string | number | boolean | undefined | null;
}

export interface PaginatedUsersResponse {
  content: UserProfile[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export const userApi = {
  // Perfil propio (completo)
  async getProfile(): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/users/me/profile`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener perfil");
    }

    return res.json();
  },

  async getMyFullProfile(): Promise<UserProfile> {
    return this.getProfile();
  },

  // Perfil completo de otro usuario
  async getUserFullProfile(userId: number): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/users/${userId}/profile`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener perfil completo del usuario");
    }

    return res.json();
  },

  // Alertas del usuario autenticado
  async getUserAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/alert/my-alerts`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas del usuario");
    }

    return res.json();
  },

  // Estadisticas del usuario autenticado
  async getUserStats(): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/api/users/me/statistics`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadisticas");
    }

    return res.json();
  },

  async getMyStatistics(): Promise<UserStats> {
    return this.getUserStats();
  },

  // Estadisticas de otro usuario
  async getUserStatistics(userId: number): Promise<UserStats> {
    const res = await fetch(`${API_BASE}/api/users/${userId}/statistics`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadisticas del usuario");
    }

    return res.json();
  },

  // Actualizar mi perfil (propio)
  async updateProfile(data: {
    email?: string;
    username?: string;
  }): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/users/me`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar perfil");
    }

    return res.json();
  },

  // Listado de usuarios (ADMIN)
  async getUsers(
    params: UserPaginationParams = {}
  ): Promise<PaginatedUsersResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/users${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener usuarios");
    }

    return res.json();
  },

  async getUserById(id: number): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener usuario");
    }

    return res.json();
  },

  async getUserByUsername(username: string): Promise<UserProfile> {
    const res = await fetch(
      `${API_BASE}/api/users/username/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener usuario por nombre");
    }

    return res.json();
  },

  async updateUser(
    id: number,
    data: Partial<Pick<UserProfile, "email" | "username">>
  ): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar usuario");
    }

    return res.json();
  },

  async deleteUser(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/users/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar usuario");
    }
  },

  // Contraseña y recuperación
  async changeMyPassword(data: ChangePasswordRequestDTO): Promise<void> {
    const res = await fetch(`${API_BASE}/api/users/me/password`, {
      method: "PATCH",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al cambiar contrasena");
    }
  },

  async forgotPassword(data: ForgotPasswordRequestDTO): Promise<void> {
    const res = await fetch(`${API_BASE}/api/users/forgot-password`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al solicitar restablecimiento de contrasena");
    }
  },

  async resetPassword(data: ResetPasswordRequestDTO): Promise<void> {
    const res = await fetch(`${API_BASE}/api/users/reset-password`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al restablecer contrasena");
    }
  },

  // Insignias
  async getMyBadges(): Promise<UserBadge[]> {
    const res = await fetch(`${API_BASE}/api/users/me/badges`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener mis insignias");
    }

    return res.json();
  },

  async getUserBadges(userId: number): Promise<UserBadge[]> {
    const res = await fetch(`${API_BASE}/api/users/${userId}/badges`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener insignias del usuario");
    }

    return res.json();
  },

  // Progreso de nivel
  async getMyLevelProgress(): Promise<UserLevelProgress> {
    const res = await fetch(`${API_BASE}/api/users/me/level-progress`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener progreso de nivel");
    }

    return res.json();
  },

  async getUserLevelProgress(userId: number): Promise<UserLevelProgress> {
    const res = await fetch(`${API_BASE}/api/users/${userId}/level-progress`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener progreso de nivel del usuario");
    }

    return res.json();
  },
};
