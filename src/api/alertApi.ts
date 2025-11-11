// src/api/alertApi.ts
import { Alert, AlertStatus, CreateAlertDTO } from "@/types/Alert";

// 🔹 Si existe VITE_API_URL (Vercel), la usa.
// 🔹 Si no, usa localhost (desarrollo).
const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8080/api/alert";

export const alertApi = {
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Error al obtener alertas");
    return res.json();
  },

  async getActiveAlerts(): Promise<Alert[]> {
    const res = await fetch(`${API_BASE}/active`);
    if (!res.ok) throw new Error("Error al obtener alertas activas");
    return res.json();
  },

  async createAlert(data: CreateAlertDTO): Promise<Alert> {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    const res = await fetch(`${API_BASE}/${id}/status?status=${status}`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Error al actualizar estado");
    return res.json();
  },

  async deleteAlert(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Error al eliminar alerta");
  },
};

// Compatibilidad con imports antiguos
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
