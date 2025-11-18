import { API_BASE } from "./baseUrl";
import {
  FavoriteRouteRequestDTO,
  FavoriteRoute,
  FavoriteAlert,
  FavoritesPaginationParams,
  PaginatedFavoriteRoutesResponse,
  PaginatedFavoriteAlertsResponse,
} from "@/types/Favorite";

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

export const favoritesApi = {
  // ==== RUTAS FAVORITAS ====

  async addFavoriteRoute(
    data: FavoriteRouteRequestDTO
  ): Promise<FavoriteRoute> {
    const res = await fetch(`${API_BASE}/api/favorites/routes`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al agregar ruta favorita");
    }

    return res.json();
  },

  async getFavoriteRoutes(): Promise<FavoriteRoute[]> {
    const res = await fetch(`${API_BASE}/api/favorites/routes`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener rutas favoritas");
    }

    return res.json();
  },

  async getFavoriteRoutesPaginated(
    params: FavoritesPaginationParams = {}
  ): Promise<PaginatedFavoriteRoutesResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/favorites/routes/paginated${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener rutas favoritas paginadas");
    }

    return res.json();
  },

  async deleteFavoriteRoute(routeId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/favorites/routes/${routeId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar ruta favorita");
    }
  },

  async updateRouteLastUsed(routeId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/favorites/routes/${routeId}/last-used`,
      {
        method: "PATCH",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al actualizar fecha de uso de la ruta");
    }
  },

  async isRouteFavorite(routeId: number): Promise<boolean> {
    const res = await fetch(
      `${API_BASE}/api/favorites/routes/${routeId}/is-favorite`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al comprobar si la ruta es favorita");
    }

    const data = await res.json();
    // Suponemos que el backend devuelve { favorite: boolean } o un boolean plano
    if (typeof data === "boolean") return data;
    return !!(data && (data.favorite ?? data.isFavorite));
  },

  // ==== ALERTAS FAVORITAS ====

  async addFavoriteAlert(alertId: number): Promise<FavoriteAlert> {
    const res = await fetch(
      `${API_BASE}/api/favorites/alerts/${alertId}`,
      {
        method: "POST",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al agregar alerta a favoritos");
    }

    return res.json();
  },

  async getFavoriteAlerts(): Promise<FavoriteAlert[]> {
    const res = await fetch(`${API_BASE}/api/favorites/alerts`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener alertas favoritas");
    }

    return res.json();
  },

  async getFavoriteAlertsPaginated(
    params: FavoritesPaginationParams = {}
  ): Promise<PaginatedFavoriteAlertsResponse> {
    const query = buildQuery(params);

    const res = await fetch(
      `${API_BASE}/api/favorites/alerts/paginated${query}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener alertas favoritas paginadas");
    }

    return res.json();
  },

  async deleteFavoriteAlert(alertId: number): Promise<void> {
    const res = await fetch(
      `${API_BASE}/api/favorites/alerts/${alertId}`,
      {
        method: "DELETE",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar alerta de favoritos");
    }
  },

  async isAlertFavorite(alertId: number): Promise<boolean> {
    const res = await fetch(
      `${API_BASE}/api/favorites/alerts/${alertId}/is-favorite`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al comprobar si la alerta es favorita");
    }

    const data = await res.json();
    if (typeof data === "boolean") return data;
    return !!(data && (data.favorite ?? data.isFavorite));
  },
};

