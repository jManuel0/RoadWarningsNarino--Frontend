const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:8080";

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

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export const uploadApi = {
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/api/upload/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Error al subir la imagen');
    }

    return res.json();
  },

  async uploadAlertImage(alertId: number, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(`${API_BASE}/api/alert/${alertId}/image`, {
      method: 'POST',
      headers: authHeaders(),
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Error al subir la imagen de la alerta');
    }

    return res.json();
  },
};
