import { Alert, AlertStatus, CreateAlertDTO } from "@/types/Alert";

const CACHE_KEY = "offline-alert-cache";
const QUEUE_KEY = "offline-alert-actions";
const MAX_CACHE_ENTRIES = 120;

export type OfflineAction = {
  id: string;
  type: "create-alert";
  payload: CreateAlertDTO;
  createdAt: number;
};

const isBrowser = () => typeof window !== "undefined";

function readFromStorage<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = window.localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Offline storage write failed:", error);
  }
}

function buildPendingAlert(payload: CreateAlertDTO): Alert {
  const timestamp = new Date().toISOString();
  return {
    id: -Date.now(),
    type: payload.type,
    title: payload.title,
    description: payload.description,
    latitude: payload.latitude,
    longitude: payload.longitude,
    location: payload.location ?? "Ubicación sin confirmar",
    municipality: payload.municipality,
    severity: payload.severity,
    status: AlertStatus.ACTIVE,
    timestamp,
    estimatedDuration: payload.estimatedDuration,
    affectedRoads: payload.affectedRoads,
    imageUrl: payload.imageUrl,
    isPending: true,
    isOffline: true,
  };
}

function clampCache(alerts: Alert[]): Alert[] {
  return alerts.slice(0, MAX_CACHE_ENTRIES);
}

function cacheAlerts(alerts: Alert[]): void {
  const normalized = clampCache(alerts);
  writeToStorage(CACHE_KEY, normalized);
}

function getCachedAlerts(): Alert[] {
  return readFromStorage<Alert[]>(CACHE_KEY) ?? [];
}

function addAlertToCache(alert: Alert): void {
  const existing = getCachedAlerts();
  const filtered = existing.filter((item) => item.id !== alert.id);
  cacheAlerts([alert, ...filtered]);
}

function queueCreateAlert(payload: CreateAlertDTO): OfflineAction {
  const queue = getQueuedActions();
  const action: OfflineAction = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "create-alert",
    payload,
    createdAt: Date.now(),
  };
  queue.push(action);
  writeToStorage(QUEUE_KEY, queue);
  return action;
}

function getQueuedActions(): OfflineAction[] {
  return readFromStorage<OfflineAction[]>(QUEUE_KEY) ?? [];
}

function removeQueuedAction(id: string): void {
  const queue = getQueuedActions().filter((action) => action.id !== id);
  writeToStorage(QUEUE_KEY, queue);
}

function clearQueue(): void {
  writeToStorage(QUEUE_KEY, []);
}

function getQueueLength(): number {
  return getQueuedActions().length;
}

export const offlineAlertService = {
  cacheAlerts,
  getCachedAlerts,
  addAlertToCache,
  queueCreateAlert,
  getQueuedActions,
  removeQueuedAction,
  clearQueue,
  getQueueLength,
  buildPendingAlert,
};
