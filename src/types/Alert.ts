// src/types/Alert.ts

export enum AlertType {
  DERRUMBE = "DERRUMBE",
  ACCIDENTE = "ACCIDENTE",
  INUNDACION = "INUNDACION",
  CIERRE_VIAL = "CIERRE_VIAL",
  MANTENIMIENTO = "MANTENIMIENTO",
}

export enum AlertSeverity {
  CRITICA = "CRITICA",
  ALTA = "ALTA",
  MEDIA = "MEDIA",
  BAJA = "BAJA",
}

export enum AlertStatus {
  ACTIVE = "ACTIVE",
  RESOLVED = "RESOLVED",
  IN_PROGRESS = "IN_PROGRESS",
}

export interface Alert {
  id: number;
  type: AlertType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  municipality?: string;
  severity: AlertSeverity;
  status: AlertStatus;

  imageUrl?: string;
  upvotes?: number;
  downvotes?: number;

  estimatedDuration?: number;
  affectedRoads?: string[];

  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;

  username?: string;
  userId?: number;
}

// Helper type para compatibilidad con código que use location.address, location.lat, location.lng
export interface AlertWithLocationObject extends Omit<Alert, 'location'> {
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  timestamp?: string; // Alias para createdAt
  priority?: AlertSeverity; // Alias para severity
}

// Función helper para convertir Alert a AlertWithLocationObject
export function toAlertWithLocationObject(alert: Alert): AlertWithLocationObject {
  return {
    ...alert,
    location: {
      address: alert.location,
      lat: alert.latitude,
      lng: alert.longitude,
    },
    timestamp: alert.createdAt,
    priority: alert.severity,
  };
}

// Función helper para convertir AlertWithLocationObject a Alert
export function fromAlertWithLocationObject(alert: AlertWithLocationObject): Alert {
  const { location, timestamp, priority, ...rest } = alert;
  return {
    ...rest,
    location: location.address,
    latitude: location.lat,
    longitude: location.lng,
    createdAt: timestamp || rest.createdAt,
    severity: priority || rest.severity,
  };
}

export interface CreateAlertDTO {
  type: AlertType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  municipality?: string;
  severity: AlertSeverity;
  estimatedDuration?: number;
  affectedRoads?: string[];
  imageUrl?: string;
}

// 🔄 Alias opcional (mantiene compatibilidad con código antiguo)
export { AlertSeverity as AlertPriority };
