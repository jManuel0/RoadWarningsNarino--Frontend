// src/stores/filterStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AlertType, AlertSeverity, AlertStatus } from "@/types/Alert";

export interface FilterOptions {
  types: AlertType[];
  severities: AlertSeverity[];
  statuses: AlertStatus[];
  dateFrom: string;
  dateTo: string;
  municipality: string;
}

interface FilterState {
  filters: FilterOptions;
  setFilters: (filters: Partial<FilterOptions>) => void;
  clearFilters: () => void;
  toggleType: (type: AlertType) => void;
  toggleSeverity: (severity: AlertSeverity) => void;
  toggleStatus: (status: AlertStatus) => void;
}

const defaultFilters: FilterOptions = {
  types: [],
  severities: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
  municipality: "",
};

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: defaultFilters,

      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () =>
        set({
          filters: defaultFilters,
        }),

      toggleType: (type) =>
        set((state) => ({
          filters: {
            ...state.filters,
            types: state.filters.types.includes(type)
              ? state.filters.types.filter((t) => t !== type)
              : [...state.filters.types, type],
          },
        })),

      toggleSeverity: (severity) =>
        set((state) => ({
          filters: {
            ...state.filters,
            severities: state.filters.severities.includes(severity)
              ? state.filters.severities.filter((s) => s !== severity)
              : [...state.filters.severities, severity],
          },
        })),

      toggleStatus: (status) =>
        set((state) => ({
          filters: {
            ...state.filters,
            statuses: state.filters.statuses.includes(status)
              ? state.filters.statuses.filter((s) => s !== status)
              : [...state.filters.statuses, status],
          },
        })),
    }),
    {
      name: "filter-storage",
    }
  )
);
