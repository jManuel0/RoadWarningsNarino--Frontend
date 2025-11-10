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

/**
 * Lo que devuelve el backend (AlertaResponseDTO)
 */
export interface Alert {
  timestamp: string | number | Date;
  affectedRoads: any;
  priority: any;
  id: number;
  type: AlertType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;            // dirección
  municipality?: string;       // si lo agregas en backend
  severity: AlertSeverity;
  status: AlertStatus;
  username?: string;
  userId?: number;
  imageUrl?: string;
  upvotes?: number;
  downvotes?: number;
  estimatedDuration?: number;
  createdAt?: string;
  updatedAt?: string;
  expiresAt?: string;
}

/**
 * Lo que el frontend le manda al backend (AlertaRequestDTO)
 */
export interface CreateAlertDTO {
  type: AlertType;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  location: string;
  municipality?: string;       // opcional si aún no lo tienes en backend
  severity: AlertSeverity;
  estimatedDuration?: number;
  imageUrl?: string;
}
