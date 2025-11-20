import { API_BASE } from "@/api/baseUrl";
import {
  GasStation,
  GasStationRequestDTO,
  GasStationFilterDTO,
  GasStationPaginationParams,
  PaginatedGasStationResponse,
  FuelType,
} from "@/types/GasStation";

function authHeaders(json: boolean = false): HeadersInit {
  const headers: Record<string, string> = {};

  if (json) {
    headers["Content-Type"] = "application/json";
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

export const gasStationsApi = {
  async create(data: GasStationRequestDTO): Promise<GasStation> {
    const res = await fetch(`${API_BASE}/api/gas-stations`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al crear estación de servicio");
    }

    return res.json();
  },

  async getAll(): Promise<GasStation[]> {
    const res = await fetch(`${API_BASE}/api/gas-stations`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estaciones de servicio");
    }

    return res.json();
  },

  async getPaginated(
    params: GasStationPaginationParams = {}
  ): Promise<PaginatedGasStationResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/gas-stations/paginated${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estaciones paginadas");
    }

    return res.json();
  },

  async getById(id: number): Promise<GasStation> {
    const res = await fetch(`${API_BASE}/api/gas-stations/${id}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estación de servicio");
    }

    return res.json();
  },

  async update(id: number, data: GasStationRequestDTO): Promise<GasStation> {
    const res = await fetch(`${API_BASE}/api/gas-stations/${id}`, {
      method: "PUT",
      headers: authHeaders(true),
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error("Error al actualizar estación de servicio");
    }

    return res.json();
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE}/api/gas-stations/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al eliminar estación de servicio");
    }
  },

  async getNearby(params: {
    latitude: number;
    longitude: number;
    radiusKm: number;
  }): Promise<GasStation[]> {
    const query = buildQuery({
      latitude: params.latitude,
      longitude: params.longitude,
      radiusKm: params.radiusKm,
    });

    const res = await fetch(`${API_BASE}/api/gas-stations/nearby${query}`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estaciones cercanas");
    }

    return res.json();
  },

  async filter(
    filters: GasStationFilterDTO,
    params: GasStationPaginationParams = {}
  ): Promise<PaginatedGasStationResponse> {
    const query = buildQuery(params);

    const res = await fetch(`${API_BASE}/api/gas-stations/filter${query}`, {
      method: "POST",
      headers: authHeaders(true),
      body: JSON.stringify(filters),
    });

    if (!res.ok) {
      throw new Error("Error al filtrar estaciones de servicio");
    }

    return res.json();
  },

  async getOpenNow(): Promise<GasStation[]> {
    const res = await fetch(`${API_BASE}/api/gas-stations/open-now`, {
      method: "GET",
      headers: authHeaders(),
    });

    if (!res.ok) {
      throw new Error("Error al obtener estaciones abiertas");
    }

    return res.json();
  },

  async getByFuelType(fuelType: FuelType): Promise<GasStation[]> {
    const res = await fetch(
      `${API_BASE}/api/gas-stations/fuel-type/${encodeURIComponent(fuelType)}`,
      {
        method: "GET",
        headers: authHeaders(),
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener estaciones por tipo de combustible");
    }

    return res.json();
  },
};
