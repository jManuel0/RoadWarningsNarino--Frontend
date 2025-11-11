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
