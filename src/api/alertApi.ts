import axios from 'axios';
import { Alert, CreateAlertDTO, AlertStatus } from '@/types/Alert';
import { mockAlerts } from '@/utils/mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejo de errores
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Simulación de delay para mock
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const alertApi = {
  // Obtener todas las alertas
  getAlerts: async (): Promise<Alert[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockAlerts;
    }
    const response = await apiClient.get<Alert[]>('/alerts');
    return response.data.map(alert => ({
      ...alert,
      timestamp: new Date(alert.timestamp)
    }));
  },

  // Obtener alerta por ID
  getAlertById: async (id: string): Promise<Alert> => {
    if (USE_MOCK) {
      await delay(300);
      const alert = mockAlerts.find(a => a.id === id);
      if (!alert) throw new Error('Alert not found');
      return alert;
    }
    const response = await apiClient.get<Alert>(`/alerts/${id}`);
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp)
    };
  },

  // Crear nueva alerta
  createAlert: async (alert: CreateAlertDTO): Promise<Alert> => {
    if (USE_MOCK) {
      await delay(500);
      const newAlert: Alert = {
        ...alert,
        id: `mock-${Date.now()}`,
        timestamp: new Date(),
        status: AlertStatus.ACTIVE,
        title: undefined,
        longitude: 0,
        latitude: 0,
        severity: ''
      };
      mockAlerts.unshift(newAlert);
      return newAlert;
    }
    const response = await apiClient.post<Alert>('/alerts', alert);
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp)
    };
  },

  // Actualizar estado de alerta
  updateAlertStatus: async (id: string, status: AlertStatus): Promise<Alert> => {
    if (USE_MOCK) {
      await delay(300);
      const alert = mockAlerts.find(a => a.id === id);
      if (!alert) throw new Error('Alert not found');
      alert.status = status;
      return alert;
    }
    const response = await apiClient.patch<Alert>(`/alerts/${id}`, { status });
    return {
      ...response.data,
      timestamp: new Date(response.data.timestamp)
    };
  },

  // Eliminar alerta
  deleteAlert: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await delay(300);
      const index = mockAlerts.findIndex(a => a.id === id);
      if (index !== -1) mockAlerts.splice(index, 1);
      return;
    }
    await apiClient.delete(`/alerts/${id}`);
  },

  // Obtener alertas activas
  getActiveAlerts: async (): Promise<Alert[]> => {
    if (USE_MOCK) {
      await delay(500);
      return mockAlerts.filter(a => a.status === AlertStatus.ACTIVE);
    }
    const response = await apiClient.get<Alert[]>('/alerts?status=ACTIVE');
    return response.data.map(alert => ({
      ...alert,
      timestamp: new Date(alert.timestamp)
    }));
  },
};