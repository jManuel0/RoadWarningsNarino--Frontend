import { create } from 'zustand';
import { Alert, AlertStatus } from '../types/Alert';
import { ObserverSubject } from '../hooks/UseObserver';

interface AlertStore {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  alertSubject: ObserverSubject<Alert>;
  
  // Actions
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  removeAlert: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Filters
  getActiveAlerts: () => Alert[];
  getAlertsByPriority: (priority: number) => Alert[];
  getCriticalAlerts: () => Alert[];
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  loading: false,
  error: null,
  alertSubject: new ObserverSubject<Alert>(),

  setAlerts: (alerts) => set({ alerts }),

  addAlert: (alert) => {
    set((state) => ({ alerts: [alert, ...state.alerts] }));
    get().alertSubject.notify(alert);
  },

  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((alert) =>
        alert.id === id ? { ...alert, ...updates } : alert
      ),
    })),

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  getActiveAlerts: () =>
    get().alerts.filter((alert) => alert.status === AlertStatus.ACTIVE),

  getAlertsByPriority: (priority) =>
    get().alerts.filter((alert) => alert.priority === priority),

  getCriticalAlerts: () =>
    get().alerts.filter((alert) => alert.priority === 1),
}));