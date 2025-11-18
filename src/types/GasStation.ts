export type FuelType =
  | "GASOLINA_CORRIENTE"
  | "GASOLINA_PREMIUM"
  | "DIESEL"
  | "GNV"
  | "GLP"
  | string;

export interface GasStation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  municipality?: string;
  isOpen?: boolean;
  openingHours?: string;
  fuelTypes?: FuelType[];
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GasStationRequestDTO {
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  municipality?: string;
  fuelTypes?: FuelType[];
  openingHours?: string;
  phone?: string;
}

export interface GasStationFilterDTO {
  municipality?: string;
  fuelTypes?: FuelType[];
  openNow?: boolean;
}

export interface GasStationPaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc" | "ASC" | "DESC";
}

export interface PaginatedGasStationResponse {
  content: GasStation[];
  totalElements?: number;
  totalPages?: number;
  pageNumber?: number;
  pageSize?: number;
}

