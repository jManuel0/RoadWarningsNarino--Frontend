import type { Alert } from "@/types/Alert";
import type { Route } from "@/types/map.types";

// DTO para crear una ruta favorita
export interface FavoriteRouteRequestDTO {
  name?: string;
  origin: {
    lat: number;
    lng: number;
    label?: string;
  };
  destination: {
    lat: number;
    lng: number;
    label?: string;
  };
  // Opcionalmente puedes guardar la ruta calculada
  routeSummary?: {
    distance: number;
    duration: number;
  };
}

// Representación de una ruta favorita almacenada en backend
export interface FavoriteRoute {
  id: number;
  userId: number;
  name?: string;
  originLat: number;
  originLng: number;
  originLabel?: string;
  destinationLat: number;
  destinationLng: number;
  destinationLabel?: string;
  distance?: number;
  duration?: number;
  createdAt: string;
  lastUsedAt?: string;

  // Datos opcionales enriquecidos en frontend
  osrmRoute?: Route;
}

export interface FavoriteAlert {
  alertId: number;
  userId: number;
  createdAt: string;
  alert?: Alert;
}

export interface FavoritesPaginationParams
  extends Record<string, string | number | boolean | null | undefined> {
  page?: number;
  size?: number;
}

export interface PaginatedFavoriteRoutesResponse {
  content: FavoriteRoute[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaginatedFavoriteAlertsResponse {
  content: FavoriteAlert[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}
