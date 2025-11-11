import { Alert, AlertStatus, CreateAlertDTO } from "@/types/Alert";
import { useAuthStore } from "@/stores/authStore";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:8080";

const getToken = () => {
  try {
    // acceso directo a zustand persistido
    const state = useAuthStore.getState();
    return state.token;
  } catch {
    return null;
  }
};

export const alertApi = {
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/alert`);
    if (!res.ok) throw new Error("Error al obtener alertas");
    return res.json();
  },

  async getActiveAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/api/alert/active`);
    if (!res.ok) throw new Error("Error al obtener alertas activas");
    return res.json();
  },

  async createAlert(data: CreateAlertDTO): Promise<Alert> {
    const token = getToken();
    if (!token) throw new Error("NO_AUTH");

    const res = await fetch(`${API_BASE}/api/alert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    const token = getToken();
    if (!token) throw new Error("NO_AUTH");

    const res = await fetch(
      `${API_BASE}/api/alert/${id}/status?status=${status}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) throw new Error("Error al actualizar estado");
    return res.json();
  },

  async deleteAlert(id: number): Promise<void> {
    const token = getToken();
    if (!token) throw new Error("NO_AUTH");

    const res = await fetch(`${API_BASE}/api/alert/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Error al eliminar alerta");
  },
};

// exports legacy (si alguien los usa)
export const getAlerts = () => alertApi.getAlerts();
export const getActiveAlerts = () => alertApi.getActiveAlerts();
// 👇 Exporta directamente la función para compatibilidad
export const createAlert = (data: CreateAlertDTO) => alertApi.createAlert(data);
