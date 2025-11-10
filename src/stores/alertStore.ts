// src/stores/alertStore.ts
import { create } from "zustand";
import { Alert } from "@/types/Alert";

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: number, data: Partial<Alert>) => void;
  removeAlert: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],
  loading: false,
  error: null,

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
    })),

  updateAlert: (id, data) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
    })),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
