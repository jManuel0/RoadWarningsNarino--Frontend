import { API_BASE } from "@/api/baseUrl";
import type { UserProfile, UserPaginationParams } from "./userApi";

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

export type AdminUserRole = "ADMIN" | "MODERATOR" | "USER";

export interface AdminUser extends UserProfile {
  role: AdminUserRole;
  active: boolean;
}

export interface PaginatedAdminUsersResponse {
  content: AdminUser[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  admins: number;
  moderators: number;
  lockedUsers?: number;
  [key: string]: number | undefined;
}

export const adminApi = {
  async getUsers(
    params: UserPaginationParams = {}
  ): Promise<PaginatedAdminUsersResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/admin/users${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener usuarios (admin)");
    }

    return res.json();
  },

  async getUserById(userId: number): Promise<AdminUser> {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener usuario (admin)");
    }

    return res.json();
  },

  async updateUserRole(
    userId: number,
    role: AdminUserRole
  ): Promise<AdminUser> {
    const query = buildQuery({ role });

    const res = await fetch(
      `${API_BASE}/api/admin/users/${userId}/role${query}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al actualizar rol de usuario");
    }

    return res.json();
  },

  async updateUserStatus(userId: number, active: boolean): Promise<AdminUser> {
    const query = buildQuery({ active });

    const res = await fetch(
      `${API_BASE}/api/admin/users/${userId}/status${query}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al actualizar estado de usuario");
    }

    return res.json();
  },

  async getUsersByRole(role: AdminUserRole): Promise<AdminUser[]> {
    const res = await fetch(
      `${API_BASE}/api/admin/users/by-role/${encodeURIComponent(role)}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener usuarios por rol");
    }

    return res.json();
  },

  async deleteUser(userId: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar usuario");
    }
  },

  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/api/admin/stats`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estadísticas de admin");
    }

    return res.json();
  },
};
