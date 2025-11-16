// src/api/alertApi.ts
import { Alert, AlertStatus, CreateAlertDTO } from "@/types/Alert";
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
