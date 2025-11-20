import { API_BASE } from "@/api/baseUrl";
import type { AlertSearchDTO } from "@/types/Alert";

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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

export type ExportFormat = "CSV" | "JSON";

export interface ExportResult {
  blob: Blob;
  filename: string | null;
  contentType: string | null;
}

export const exportApi = {
  /**
   * Exporta alertas según criterios de búsqueda, devolviendo un archivo
   * en formato CSV o JSON.
   *
   * El backend expone: POST /api/export/alerts?format=CSV|JSON
   * con body AlertSearchDTO.
   */
  async exportAlerts(
    format: ExportFormat,
    criteria: AlertSearchDTO
  ): Promise<ExportResult> {
    const res = await fetch(
      `${API_BASE}/api/export/alerts?format=${encodeURIComponent(format)}`,
      {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(criteria),
      }
    );

    if (!res.ok) {
      throw new Error("Error al exportar alertas");
    }

    const blob = await res.blob();

    const contentType = res.headers.get("Content-Type");
    const disposition = res.headers.get("Content-Disposition");
    let filename: string | null = null;

    if (disposition) {
      const match = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(disposition);
      if (match?.[1]) {
        filename = decodeURIComponent(match[1].replace(/"/g, ""));
      }
    }

    return {
      blob,
      filename,
      contentType,
    };
  },
};
