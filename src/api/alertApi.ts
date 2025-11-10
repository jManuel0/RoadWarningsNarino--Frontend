// src/api/alertApi.ts
import {
  Alert,
  AlertStatus,
  AlertSeverity,
  CreateAlertDTO,
} from "@/types/Alert";

const BASE_URL = "http://localhost:8080/api/alerts";

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Error ${res.status} al llamar ${res.url}: ${text || res.statusText}`
    );
  }
  return (await res.json()) as T;
}

export const alertApi = {
  /**
   * Obtener todas las alertas
   */
  async getAlerts(): Promise<Alert[]> {
    const res = await fetch(BASE_URL);
    const data = await handleJson<Alert[]>(res);

    // Si el backend ya devuelve el DTO correcto, esto es suficiente.
    // Si alguna propiedad viene como string/nullable, aquí podrías normalizar.
    return data.map((a) => ({
      ...a,
      id: Number(a.id), // asegurar number
      title: a.title ?? "",
      description: a.description ?? "",
      location: a.location ?? "",
      severity: (a.severity) ?? AlertSeverity.MEDIA,
      status: a.status,
      type: a.type,
    }));
  },

  /**
   * Crear una nueva alerta
   */
  async createAlert(dto: CreateAlertDTO): Promise<Alert> {
    const res = await fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dto),
    });

    const a = await handleJson<Alert>(res);

    return {
      ...a,
      id: Number(a.id),
      title: a.title ?? "",
      description: a.description ?? "",
      location: a.location ?? "",
      severity: (a.severity) ?? dto.severity,
      status: a.status,
      type: a.type,
    };
  },

  /**
   * Actualizar el estado de una alerta
   * (PATCH /api/alerts/{id}/status?status=ACTIVE|IN_PROGRESS|RESOLVED)
   */
  async updateAlertStatus(id: number, status: AlertStatus): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}/status?status=${status}`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Error ${res.status} al actualizar estado: ${text || res.statusText}`
      );
    }
  },

  /**
   * Eliminar una alerta
   */
  async deleteAlert(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `Error ${res.status} al eliminar alerta: ${text || res.statusText}`
      );
    }
  },
};
