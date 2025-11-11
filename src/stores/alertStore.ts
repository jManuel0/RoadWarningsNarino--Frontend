// src/stores/alertStore.ts
import { create } from "zustand";
import { Alert, AlertSeverity, AlertStatus } from "@/types/Alert";

// --- Subject sencillo para notificar nuevas alertas (para useObserver) ---
type Observer<T> = (data: T) => void;

class Subject<T> {
  private observers: Observer<T>[] = [];

  attach(observer: Observer<T>): void {
    this.observers.push(observer);
  }

  detach(observer: Observer<T>): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data: T): void {
    this.observers.forEach((observer) => observer(data));
  }
}

// Instancia global
const alertSubjectInstance = new Subject<Alert>();

// --- Definición del estado ---
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

  getActiveAlerts: () => Alert[];
  getCriticalAlerts: () => Alert[];

  alertSubject: Subject<Alert>;
}

export const useAlertStore = create<AlertState>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
    }));
    // Notificar a los observadores (Home, notificaciones, etc.)
    alertSubjectInstance.notify(alert);
  },

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

  getActiveAlerts: () =>
    get().alerts.filter((a) => a.status === AlertStatus.ACTIVE),

  getCriticalAlerts: () =>
    get().alerts.filter(
      (a) =>
        a.status === AlertStatus.ACTIVE &&
        a.severity === AlertSeverity.CRITICA
    ),

  alertSubject: alertSubjectInstance,
}));
