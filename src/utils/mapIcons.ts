/**
 * Utilidades para crear iconos personalizados del mapa
 * Genera iconos HTML/SVG para diferentes tipos de alertas y marcadores
 */

import L from 'leaflet';
import { AlertType, AlertSeverity, MarkerType } from '@/types/map.types';

// ============================================================================
// CONFIGURACIÓN DE COLORES
// ============================================================================

/**
 * Colores por tipo de alerta
 */
const ALERT_COLORS: Record<AlertType, string> = {
  [AlertType.ACCIDENTE]: '#ef4444', // Rojo - Crítico
  [AlertType.DERRUMBE]: '#f97316', // Naranja - Muy peligroso
  [AlertType.INUNDACION]: '#3b82f6', // Azul - Agua
  [AlertType.VIA_CERRADA]: '#dc2626', // Rojo oscuro - Bloqueado
  [AlertType.OBRAS_VIALES]: '#eab308', // Amarillo - Precaución
  [AlertType.NEBLINA]: '#94a3b8', // Gris azulado - Neblina
  [AlertType.TRAFICO_PESADO]: '#f59e0b', // Ámbar - Congestión
  [AlertType.VEHICULO_VARADO]: '#a855f7', // Púrpura - Vehículo
  [AlertType.POLICIA]: '#1d4ed8', // Azul oscuro - Autoridad
  [AlertType.PROTESTA]: '#dc2626', // Rojo - Bloqueo
  [AlertType.ANIMALES_EN_VIA]: '#84cc16', // Verde lima - Animal
  [AlertType.SEMAFORO_DANADO]: '#facc15', // Amarillo brillante
  [AlertType.OTROS]: '#6b7280', // Gris - Genérico
};

/**
 * Colores por severidad de alerta
 */
const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.BAJA]: '#22c55e', // Verde
  [AlertSeverity.MEDIA]: '#eab308', // Amarillo
  [AlertSeverity.ALTA]: '#f97316', // Naranja
  [AlertSeverity.CRITICA]: '#ef4444', // Rojo
};

/**
 * Emojis por tipo de alerta (para fallback o iconos simples)
 */
const ALERT_EMOJIS: Record<AlertType, string> = {
  [AlertType.ACCIDENTE]: '🚗💥',
  [AlertType.DERRUMBE]: '🪨',
  [AlertType.INUNDACION]: '🌊',
  [AlertType.VIA_CERRADA]: '🚧',
  [AlertType.OBRAS_VIALES]: '🔧',
  [AlertType.NEBLINA]: '🌫️',
  [AlertType.TRAFICO_PESADO]: '🚦',
  [AlertType.VEHICULO_VARADO]: '🚗⚠️',
  [AlertType.POLICIA]: '👮',
  [AlertType.PROTESTA]: '⚠️',
  [AlertType.ANIMALES_EN_VIA]: '🐄',
  [AlertType.SEMAFORO_DANADO]: '🚦❌',
  [AlertType.OTROS]: '⚠️',
};

// ============================================================================
// FUNCIONES DE CREACIÓN DE ICONOS
// ============================================================================

/**
 * Crea un icono SVG para una alerta
 * @param type - Tipo de alerta
 * @param severity - Severidad de la alerta
 * @param size - Tamaño del icono en píxeles
 * @returns Icono de Leaflet
 */
export function createAlertIcon(
  type: AlertType,
  severity: AlertSeverity,
  size: number = 40
): L.DivIcon {
  const color = ALERT_COLORS[type];
  const severityColor = SEVERITY_COLORS[severity];
  const emoji = ALERT_EMOJIS[type];

  // Crear SVG personalizado para el icono
  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <!-- Círculo exterior con color de severidad -->
      <circle cx="20" cy="20" r="19" fill="${severityColor}" opacity="0.3" stroke="${severityColor}" stroke-width="2"/>

      <!-- Círculo interior con color de tipo de alerta -->
      <circle cx="20" cy="20" r="14" fill="${color}" stroke="white" stroke-width="2"/>

      <!-- Emoji centrado -->
      <text x="20" y="20" font-size="16" text-anchor="middle" dominant-baseline="central">
        ${emoji}
      </text>

      <!-- Indicador de severidad (triángulo en la esquina) -->
      ${
        severity === AlertSeverity.CRITICA
          ? `<path d="M 35 5 L 40 0 L 40 10 Z" fill="${severityColor}" />`
          : ''
      }
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-alert-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

/**
 * Crea un icono para la ubicación del usuario
 * @param heading - Dirección en grados (opcional, para mostrar orientación)
 * @returns Icono de Leaflet
 */
export function createUserLocationIcon(heading?: number): L.DivIcon {
  const size = 24;

  // Si hay heading, mostrar dirección
  const rotation = heading !== undefined ? `rotate(${heading} 12 12)` : '';

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <!-- Círculo exterior azul con pulso -->
      <circle cx="12" cy="12" r="11" fill="#3b82f6" opacity="0.2" class="pulse-circle"/>

      <!-- Círculo principal -->
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="3"/>

      <!-- Indicador de dirección (si hay heading) -->
      ${
        heading !== undefined
          ? `<path d="M 12 2 L 15 8 L 12 6 L 9 8 Z" fill="white" transform="${rotation}"/>`
          : ''
      }
    </svg>
    <style>
      @keyframes pulse {
        0%, 100% { opacity: 0.2; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(1.1); }
      }
      .pulse-circle {
        animation: pulse 2s ease-in-out infinite;
      }
    </style>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-user-location-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Crea un icono para origen/destino de ruta
 * @param type - Tipo de marcador ('origin' o 'destination')
 * @param label - Letra o número a mostrar
 * @returns Icono de Leaflet
 */
export function createWaypointIcon(
  type: 'origin' | 'destination' | 'waypoint',
  label?: string
): L.DivIcon {
  const colors = {
    origin: '#10b981', // Verde
    destination: '#ef4444', // Rojo
    waypoint: '#3b82f6', // Azul
  };

  const labels = {
    origin: 'A',
    destination: 'B',
    waypoint: '•',
  };

  const color = colors[type];
  const displayLabel = label || labels[type];
  const size = 36;

  const svgIcon = `
    <svg width="${size}" height="${size + 10}" viewBox="0 0 36 46" xmlns="http://www.w3.org/2000/svg">
      <!-- Pin de mapa -->
      <path
        d="M 18 0 C 11 0 5 6 5 13 C 5 20 18 36 18 36 S 31 20 31 13 C 31 6 25 0 18 0 Z"
        fill="${color}"
        stroke="white"
        stroke-width="2"
      />

      <!-- Círculo interior blanco -->
      <circle cx="18" cy="13" r="8" fill="white"/>

      <!-- Letra o número -->
      <text
        x="18"
        y="13"
        font-size="14"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="central"
        fill="${color}"
      >
        ${displayLabel}
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: `custom-waypoint-icon waypoint-${type}`,
    iconSize: [size, size + 10],
    iconAnchor: [size / 2, size + 10],
    popupAnchor: [0, -(size + 10)],
  });
}

/**
 * Crea un icono para cluster de alertas
 * @param count - Número de alertas en el cluster
 * @param maxSeverity - Severidad máxima de las alertas agrupadas
 * @returns Icono de Leaflet
 */
export function createClusterIcon(
  count: number,
  maxSeverity: AlertSeverity = AlertSeverity.MEDIA
): L.DivIcon {
  const severityColor = SEVERITY_COLORS[maxSeverity];
  const size = Math.min(60, 30 + count * 2); // Tamaño dinámico basado en cantidad

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
      <!-- Círculo exterior -->
      <circle cx="30" cy="30" r="29" fill="${severityColor}" opacity="0.4"/>

      <!-- Círculo medio -->
      <circle cx="30" cy="30" r="22" fill="${severityColor}" opacity="0.6"/>

      <!-- Círculo interior -->
      <circle cx="30" cy="30" r="18" fill="${severityColor}" stroke="white" stroke-width="3"/>

      <!-- Número de alertas -->
      <text
        x="30"
        y="30"
        font-size="18"
        font-weight="bold"
        text-anchor="middle"
        dominant-baseline="central"
        fill="white"
      >
        ${count}
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Crea un icono para estación de gasolina
 * @returns Icono de Leaflet
 */
export function createGasStationIcon(): L.DivIcon {
  const size = 32;

  const svgIcon = `
    <svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <!-- Círculo de fondo -->
      <circle cx="16" cy="16" r="15" fill="#059669" stroke="white" stroke-width="2"/>

      <!-- Emoji de gasolina -->
      <text x="16" y="16" font-size="18" text-anchor="middle" dominant-baseline="central">
        ⛽
      </text>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-gas-station-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Obtiene el color para un tipo de alerta
 * @param type - Tipo de alerta
 * @returns Color hexadecimal
 */
export function getAlertColor(type: AlertType): string {
  return ALERT_COLORS[type] || ALERT_COLORS[AlertType.OTROS];
}

/**
 * Obtiene el color para una severidad
 * @param severity - Severidad de la alerta
 * @returns Color hexadecimal
 */
export function getSeverityColor(severity: AlertSeverity): string {
  return SEVERITY_COLORS[severity] || SEVERITY_COLORS[AlertSeverity.MEDIA];
}

/**
 * Obtiene el emoji para un tipo de alerta
 * @param type - Tipo de alerta
 * @returns Emoji
 */
export function getAlertEmoji(type: AlertType): string {
  return ALERT_EMOJIS[type] || ALERT_EMOJIS[AlertType.OTROS];
}

/**
 * Crea un icono genérico basado en el tipo de marcador
 * @param type - Tipo de marcador
 * @param data - Datos adicionales para personalizar el icono
 * @returns Icono de Leaflet
 */
export function createMarkerIcon(type: MarkerType, data?: any): L.DivIcon {
  switch (type) {
    case MarkerType.USER_LOCATION:
      return createUserLocationIcon(data?.heading);

    case MarkerType.ALERT:
      return createAlertIcon(
        data?.type || AlertType.OTROS,
        data?.severity || AlertSeverity.MEDIA
      );

    case MarkerType.ORIGIN:
      return createWaypointIcon('origin', data?.label);

    case MarkerType.DESTINATION:
      return createWaypointIcon('destination', data?.label);

    case MarkerType.WAYPOINT:
      return createWaypointIcon('waypoint', data?.label);

    case MarkerType.GAS_STATION:
      return createGasStationIcon();

    default:
      return createWaypointIcon('waypoint');
  }
}

// ============================================================================
// ESTILOS CSS GLOBALES PARA ICONOS
// ============================================================================

/**
 * Inyecta estilos CSS globales para los iconos del mapa
 * Debe llamarse una vez al inicializar la aplicación
 */
export function injectMapIconStyles(): void {
  if (typeof document === 'undefined') return;

  const styleId = 'leaflet-custom-icons-styles';

  // Evitar inyectar múltiples veces
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .custom-alert-icon,
    .custom-user-location-icon,
    .custom-waypoint-icon,
    .custom-cluster-icon,
    .custom-gas-station-icon {
      background: none !important;
      border: none !important;
      box-shadow: none !important;
    }

    .custom-alert-icon svg,
    .custom-user-location-icon svg,
    .custom-waypoint-icon svg,
    .custom-cluster-icon svg,
    .custom-gas-station-icon svg {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
      transition: transform 0.2s ease;
    }

    .custom-alert-icon:hover svg,
    .custom-cluster-icon:hover svg {
      transform: scale(1.1);
      cursor: pointer;
    }

    .leaflet-marker-icon.custom-alert-icon,
    .leaflet-marker-icon.custom-cluster-icon {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    /* Animación de pulso para ubicación del usuario */
    @keyframes pulse {
      0%, 100% {
        opacity: 0.2;
        transform: scale(1);
      }
      50% {
        opacity: 0.4;
        transform: scale(1.15);
      }
    }
  `;

  document.head.appendChild(style);
}
