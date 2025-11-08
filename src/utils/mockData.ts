import { Alert, AlertType, AlertPriority, AlertStatus } from '@/types/Alert';

export const mockAlerts: Alert[] = [
  {
    id: '1',
    type: AlertType.DERRUMBE,
    priority: AlertPriority.CRITICA,
    location: {
      lat: 1.2136,
      lng: -77.2811,
      address: 'Vía Pasto - Cali, Km 5',
    },
    affectedRoads: ['Vía Panamericana', 'Ruta 25'],
    description: 'Derrumbe de gran magnitud bloqueando completamente la vía. Se recomienda tomar rutas alternas.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // Hace 30 minutos
    estimatedDuration: 240,
    status: AlertStatus.ACTIVE,
  },
  {
    id: '2',
    type: AlertType.ACCIDENTE,
    priority: AlertPriority.ALTA,
    location: {
      lat: 1.22,
      lng: -77.275,
      address: 'Calle 18 con Carrera 25',
    },
    affectedRoads: ['Calle 18', 'Carrera 25'],
    description: 'Accidente de tránsito con 3 vehículos involucrados. Tráfico lento en el sector.',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // Hace 15 minutos
    estimatedDuration: 60,
    status: AlertStatus.IN_PROGRESS,
  },
  {
    id: '3',
    type: AlertType.INUNDACION,
    priority: AlertPriority.ALTA,
    location: {
      lat: 1.205,
      lng: -77.29,
      address: 'Avenida de los Estudiantes',
    },
    affectedRoads: ['Av. de los Estudiantes'],
    description: 'Inundación por fuertes lluvias. Nivel del agua en aumento.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45), // Hace 45 minutos
    estimatedDuration: 180,
    status: AlertStatus.ACTIVE,
  },
  {
    id: '4',
    type: AlertType.CIERRE_VIAL,
    priority: AlertPriority.MEDIA,
    location: {
      lat: 1.218,
      lng: -77.282,
      address: 'Carrera 27 entre Calles 13 y 14',
    },
    affectedRoads: ['Carrera 27'],
    description: 'Cierre programado por evento deportivo.',
    timestamp: new Date(Date.now() - 1000 * 60 * 120), // Hace 2 horas
    estimatedDuration: 180,
    status: AlertStatus.ACTIVE,
  },
  {
    id: '5',
    type: AlertType.MANTENIMIENTO,
    priority: AlertPriority.BAJA,
    location: {
      lat: 1.21,
      lng: -77.27,
      address: 'Calle 20 con Carrera 30',
    },
    affectedRoads: ['Calle 20'],
    description: 'Mantenimiento de señalización vial.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // Hace 1 hora
    estimatedDuration: 120,
    status: AlertStatus.RESOLVED,
  },
];