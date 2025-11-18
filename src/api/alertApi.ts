// src/api/alertApi.ts
import {
  Alert,
  AlertStatus,
  CreateAlertDTO,
  AlertFilterDTO,
  AlertSearchDTO,
  AlertPaginationParams,
  PaginatedAlertsResponse,
} from "@/types/Alert";
import { API_BASE } from "./baseUrl";

// Lee el token desde localStorage (guardado por authStore)
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

// Siempre devolvemos un objeto plano compatible con HeadersInit
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

// Helper genérico para construir query strings
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

export const alertApi = {
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/alert`, {
      method: "GET",
      headers: authHeaders(), // sin JSON obligatorio
    });

    if (!res.ok) {
      throw new Error(`Error al obtener alertas: ${res.status}`);
    }
    return res.json();
  },

  async getAlertsPaginated(
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/alert/paginated${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(
        `Error al obtener alertas paginadas: ${res.status}`
      );
    }

    return res.json();
  },

  async getActiveAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/alert/active`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error(`Error al obtener alertas activas: ${res.status}`);
    }
    return res.json();
  },

  async getActiveAlertsPaginated(
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/alert/active/paginated${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error(
        `Error al obtener alertas activas paginadas: ${res.status}`
      );
    }

    return res.json();
  },

  async createAlert(data: CreateAlertDTO): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Error backend crear alerta:", text);
      throw new Error("Error al crear alerta");
    }

    return res.json();
  },

  async getAlertById(id: number): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener detalle de la alerta");
    }

    return res.json();
  },

  async getNearbyAlerts(params: {
    latitude: number;
    longitude: number;
    radius: number;
  }): Promise<Alert[]> {
    const query = buildQuery({
      latitude: params.latitude,
      longitude: params.longitude,
      radius: params.radius,
    });

    const res = await fetch(
      `${API_BASE}/api/alert/nearby${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener alertas cercanas");
    }

    return res.json();
  },

  async updateAlert(
    id: number,
    data: CreateAlertDTO
  ): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert/${id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar alerta");
    }

    return res.json();
  },

  async updateAlertStatus(id: number, status: AlertStatus): Promise<Alert> {
    const res = await fetch(
      `${API_BASE}/api/alert/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al actualizar estado");
    }

    return res.json();
  },

  async deleteAlert(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/alert/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar alerta");
    }
  },

  async upvoteAlert(id: number): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert/${id}/upvote`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al votar alerta");
    }

    return res.json();
  },

  async downvoteAlert(id: number): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert/${id}/downvote`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al votar alerta");
    }

    return res.json();
  },

  async getMyAlerts(
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/alert/my-alerts${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener mis alertas");
    }

    return res.json();
  },

  async filterAlerts(
    filters: AlertFilterDTO,
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/alert/filter${query}`,
      {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(filters),
      }
    );

    if (!res.ok) {
      throw new Error("Error al filtrar alertas");
    }

    return res.json();
  },

  async getUserAlerts(
    userId: number,
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/alert/user/${userId}${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener alertas del usuario");
    }

    return res.json();
  },

  async expireAlert(id: number): Promise<Alert> {
    const res = await fetch(`${API_BASE}/api/alert/${id}/expire`, {
      method: "PATCH",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al expirar alerta");
    }

    return res.json();
  },

  async uploadAlertMedia(
    alertId: number,
    files: File[]
  ): Promise<any> {
    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const res = await fetch(
      `${API_BASE}/api/alert/${alertId}/media`,
      {
        method: "POST",
        headers: authHeaders(),
        body: formData,
      }
    );

    if (!res.ok) {
      throw new Error("Error al subir archivos de la alerta");
    }

    return res.json();
  },

  async searchAlerts(
    criteria: AlertSearchDTO,
    params: AlertPaginationParams = {}
  ): Promise<PaginatedAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/alert/search${query}`,
      {
        method: "POST",
        headers: authHeaders(true),
        body: JSON.stringify(criteria),
      }
    );

    if (!res.ok) {
      throw new Error("Error en la b��squeda de alertas");
    }

    return res.json();
  },

  // Comment endpoints
  async getComments(alertId: number): Promise<any[]> {
    const res = await fetch(`${API_BASE}/api/alert/${alertId}/comments`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener comentarios");
    }

    return res.json();
  },

  async addComment(alertId: number, content: string): Promise<any> {
    const res = await fetch(`${API_BASE}/api/alert/${alertId}/comments`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      throw new Error("Error al agregar comentario");
    }

    return res.json();
  },

  async deleteComment(alertId: number, commentId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/alert/${alertId}/comments/${commentId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar comentario");
    }
  },

  async likeComment(alertId: number, commentId: number): Promise<any> {
    const res = await fetch(
      `${API_BASE}/api/alert/${alertId}/comments/${commentId}/like`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al dar like al comentario");
    }

    return res.json();
  },

  async reportComment(alertId: number, commentId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/alert/${alertId}/comments/${commentId}/report`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al reportar comentario");
    }
  },
};

/* Exports "legacy" opcionales si alguna parte del código aún los usa */

export const getAlerts = (): Promise<Alert[]> => alertApi.getAlerts();
export const getActiveAlerts = (): Promise<Alert[]> =>
  alertApi.getActiveAlerts();
export const createAlert = (data: CreateAlertDTO): Promise<Alert> =>
  alertApi.createAlert(data);
export const updateAlertStatus = (
  id: number,
  status: AlertStatus
): Promise<Alert> => alertApi.updateAlertStatus(id, status);
export const deleteAlert = (id: number): Promise<void> =>
  alertApi.deleteAlert(id);
