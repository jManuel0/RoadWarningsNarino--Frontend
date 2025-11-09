export enum AlertType {
  DERRUMBE = 'DERRUMBE',
  ACCIDENTE = 'ACCIDENTE',
  INUNDACION = 'INUNDACION',
  CIERRE_VIAL = 'CIERRE_VIAL',
  MANTENIMIENTO = 'MANTENIMIENTO',
}

export enum AlertPriority {
  CRITICA = 1,
  ALTA = 2,
  MEDIA = 3,
  BAJA = 4,
}

export enum AlertStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
  IN_PROGRESS = 'IN_PROGRESS',
}

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Alert {
  title: any;
  longitude: number;
  latitude: number;
  severity: string;
  id: string;
  type: AlertType;
  priority: AlertPriority;
  location: Location;
  affectedRoads: string[];
  description: string;
  timestamp: Date;
  estimatedDuration?: number; // minutos
  status: AlertStatus;
}

export interface CreateAlertDTO {
  type: AlertType;
  priority: AlertPriority;
  location: Location;
  affectedRoads: string[];
  description: string;
  estimatedDuration?: number;
}