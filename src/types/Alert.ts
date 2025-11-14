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

// Alias de nombre: en el frontend podemos hablar de "priority"
export { AlertSeverity as AlertPriority };

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

  // Campo "oficial" que viene del backend
  severity: AlertSeverity;

  // Alias opcional para compatibilidad: algunos componentes usan "priority"
  priority?: AlertSeverity;

  status: AlertStatus;

  // Lo dejamos opcional porque no siempre tendrás timestamp seteado
  timestamp?: string | number | Date;

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
export interface AlertWithLocationObject
  extends Omit<Alert, "location" | "timestamp" | "priority"> {
  location: {
    address: string;
    lat: number;
    lng: number;
  };

  // Alias opcionales
  timestamp?: string;       // Alias para createdAt
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
    // Si no viene createdAt, usamos timestamp (si es string)
    timestamp:
      alert.createdAt ??
      (typeof alert.timestamp === "string" ? alert.timestamp : undefined),
    priority: alert.priority ?? alert.severity,
  };
}

// Función helper para convertir AlertWithLocationObject a Alert
export function fromAlertWithLocationObject(
  alert: AlertWithLocationObject
): Alert {
  const { location, timestamp, priority, ...rest } = alert;

  return {
    ...rest,
    location: location.address,
    latitude: location.lat,
    longitude: location.lng,
    createdAt: timestamp ?? rest.createdAt,
    severity: priority ?? rest.severity,
    priority: priority ?? rest.severity,
    // timestamp queda opcional; si quieres forzarlo, podrías poner:
    // timestamp: timestamp ?? rest.createdAt ?? new Date().toISOString(),
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
