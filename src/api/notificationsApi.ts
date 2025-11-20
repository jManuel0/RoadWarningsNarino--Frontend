import { API_BASE } from "@/api/baseUrl";
import {
  NotificationDTO,
  DeviceTokenRequestDTO,
  NotificationPaginationParams,
  PaginatedNotificationsResponse,
} from "@/types/Notification";

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

export const notificationsApi = {
  // ==== NOTIFICACIONES ====

  async getNotifications(): Promise<NotificationDTO[]> {
    const res = await fetch(`${API_BASE}/api/notifications`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener notificaciones");
    }

    return res.json();
  },

  async getNotificationsPaginated(
    params: NotificationPaginationParams = {}
  ): Promise<PaginatedNotificationsResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/notifications/paginated${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener notificaciones paginadas");
    }

    return res.json();
  },

  async getUnreadNotifications(): Promise<NotificationDTO[]> {
    const res = await fetch(`${API_BASE}/api/notifications/unread`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener notificaciones no leídas");
    }

    return res.json();
  },

  async getUnreadCount(): Promise<number> {
    const res = await fetch(`${API_BASE}/api/notifications/unread/count`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener conteo de no leídas");
    }

    const data = await res.json();
    if (typeof data === "number") return data;
    return Number(data?.count ?? data?.unread ?? 0);
  },

  async markAsRead(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al marcar notificación como leída");
    }
  },

  async markAllAsRead(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notifications/read-all`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al marcar todas como leídas");
    }
  },

  async deleteNotification(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notifications/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar notificación");
    }
  },

  async deleteReadNotifications(): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notifications/read`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar notificaciones leídas");
    }
  },

  // ==== DEVICE TOKENS ====

  async registerDeviceToken(data: DeviceTokenRequestDTO): Promise<void> {
    const res = await fetch(`${API_BASE}/api/notifications/device-token`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al registrar device token");
    }
  },

  async deleteDeviceToken(token: string): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/notifications/device-token/${encodeURIComponent(token)}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar device token");
    }
  },

  async getDeviceTokens(): Promise<DeviceTokenRequestDTO[]> {
    const res = await fetch(`${API_BASE}/api/notifications/device-tokens`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener device tokens");
    }

    return res.json();
  },
};
