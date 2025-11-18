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

export const uploadApi = {
  /**
   * Sube una imagen usando multipart/form-data hacia /api/images/upload
   * Campo requerido: file, opcional: folder
   */
  async uploadImage(
    file: File,
    folder?: string
  ): Promise<{ url: string; publicId?: string }> {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }

    const res = await fetch(`${API_BASE}/api/images/upload`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al subir la imagen");
    }

    return res.json();
  },

  /**
   * Sube una imagen como string base64 a /api/images/upload/base64
   * El folder se envía como query param.
   */
  async uploadImageBase64(
    base64: string,
    folder?: string
  ): Promise<{ url: string; publicId?: string }> {
    const query =
      folder != null && folder !== ""
        ? `?folder=${encodeURIComponent(folder)}`
        : "";

    const token = getAuthToken();
    const headers: Record<string, string> = {
      "Content-Type": "text/plain",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(
      `${API_BASE}/api/images/upload/base64${query}`,
      {
        method: "POST",
        headers,
        body: base64,
      }
    );

    if (!res.ok) {
      throw new Error("Error al subir la imagen base64");
    }

    return res.json();
  },

  /**
   * Elimina una imagen por su publicId en /api/images/{publicId}
   */
  async deleteImage(publicId: string): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/images/${encodeURIComponent(publicId)}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar la imagen");
    }
  },

  /**
   * Endpoint legacy para subir imagen asociada a una alerta concreta,
   * mantenido por compatibilidad si el backend aún lo expone.
   */
  async uploadAlertImage(
    alertId: number,
    file: File
  ): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_BASE}/api/alert/${alertId}/image`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error("Error al subir la imagen de la alerta");
    }

    return res.json();
  },
};
