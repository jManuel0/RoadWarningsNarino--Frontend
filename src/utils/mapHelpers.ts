/**
 * Funciones auxiliares para operaciones con mapas
 * Incluye cálculos geoespaciales, conversiones y utilidades de Leaflet
 */

import L, { LatLngBounds, LatLngExpression } from 'leaflet';
import { Coordinates, MapBounds, DistanceResult, RoadAlert } from '@/types/map.types';

// ============================================================================
// CONSTANTES GEOGRÁFICAS
// ============================================================================

/**
 * Radio de la Tierra en metros (para cálculos de Haversine)
 */
const EARTH_RADIUS_METERS = 6371000;

/**
 * Conversión de grados a radianes
 */
const DEG_TO_RAD = Math.PI / 180;

/**
 * Conversión de radianes a grados
 */
const RAD_TO_DEG = 180 / Math.PI;

// ============================================================================
// COORDENADAS DEL DEPARTAMENTO DE NARIÑO
// ============================================================================

/**
 * Centro geográfico de Pasto, Nariño
 */
export const PASTO_CENTER: Coordinates = {
  lat: 1.2136,
  lng: -77.2811,
};

/**
 * Límites geográficos del departamento de Nariño
 */
export const NARINO_BOUNDS: [[number, number], [number, number]] = [
  [0.5, -79.0], // Suroeste
  [2.8, -76.5], // Noreste
];

/**
 * Municipios principales de Nariño con sus coordenadas
 */
export const NARINO_MUNICIPALITIES: Record<string, Coordinates> = {
  Pasto: { lat: 1.2136, lng: -77.2811 },
  Ipiales: { lat: 0.8247, lng: -77.6425 },
  Tumaco: { lat: 1.8001, lng: -78.7998 },
  Túquerres: { lat: 1.0869, lng: -77.6169 },
  'La Unión': { lat: 1.6019, lng: -77.1294 },
  Samaniego: { lat: 1.3328, lng: -77.5878 },
  Sandona: { lat: 1.2817, lng: -77.4719 },
};

// ============================================================================
// CÁLCULOS GEOESPACIALES
// ============================================================================

/**
 * Calcula la distancia entre dos puntos usando la fórmula de Haversine
 * @param point1 - Primer punto
 * @param point2 - Segundo punto
 * @returns Distancia en metros
 */
export function calculateDistance(
  point1: Coordinates,
  point2: Coordinates
): number {
  const lat1 = point1.lat * DEG_TO_RAD;
  const lat2 = point2.lat * DEG_TO_RAD;
  const deltaLat = (point2.lat - point1.lat) * DEG_TO_RAD;
  const deltaLng = (point2.lng - point1.lng) * DEG_TO_RAD;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLng / 2) *
      Math.sin(deltaLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Calcula el rumbo (bearing) entre dos puntos
 * @param from - Punto de origen
 * @param to - Punto de destino
 * @returns Rumbo en grados (0-360)
 */
export function calculateBearing(from: Coordinates, to: Coordinates): number {
  const lat1 = from.lat * DEG_TO_RAD;
  const lat2 = to.lat * DEG_TO_RAD;
  const deltaLng = (to.lng - from.lng) * DEG_TO_RAD;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  const bearing = Math.atan2(y, x) * RAD_TO_DEG;

  return (bearing + 360) % 360; // Normalizar a 0-360
}

/**
 * Calcula distancia y rumbo entre dos puntos
 * @param from - Punto de origen
 * @param to - Punto de destino
 * @returns Objeto con distancia y rumbo
 */
export function calculateDistanceAndBearing(
  from: Coordinates,
  to: Coordinates
): DistanceResult {
  return {
    distance: calculateDistance(from, to),
    bearing: calculateBearing(from, to),
  };
}

/**
 * Calcula un punto a cierta distancia y rumbo desde un origen
 * @param origin - Punto de origen
 * @param distance - Distancia en metros
 * @param bearing - Rumbo en grados
 * @returns Nuevas coordenadas
 */
export function calculateDestination(
  origin: Coordinates,
  distance: number,
  bearing: number
): Coordinates {
  const lat1 = origin.lat * DEG_TO_RAD;
  const lng1 = origin.lng * DEG_TO_RAD;
  const bearingRad = bearing * DEG_TO_RAD;

  const angularDistance = distance / EARTH_RADIUS_METERS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearingRad)
  );

  const lng2 =
    lng1 +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    lat: lat2 * RAD_TO_DEG,
    lng: lng2 * RAD_TO_DEG,
  };
}

/**
 * Verifica si un punto está dentro de un radio desde un centro
 * @param point - Punto a verificar
 * @param center - Centro del círculo
 * @param radiusMeters - Radio en metros
 * @returns true si el punto está dentro del radio
 */
export function isWithinRadius(
  point: Coordinates,
  center: Coordinates,
  radiusMeters: number
): boolean {
  return calculateDistance(point, center) <= radiusMeters;
}

/**
 * Encuentra el punto más cercano de un array de coordenadas
 * @param target - Punto objetivo
 * @param points - Array de puntos
 * @returns Punto más cercano y su distancia
 */
export function findNearestPoint(
  target: Coordinates,
  points: Coordinates[]
): { point: Coordinates; distance: number; index: number } | null {
  if (points.length === 0) return null;

  let nearest = {
    point: points[0],
    distance: calculateDistance(target, points[0]),
    index: 0,
  };

  for (let i = 1; i < points.length; i++) {
    const distance = calculateDistance(target, points[i]);
    if (distance < nearest.distance) {
      nearest = { point: points[i], distance, index: i };
    }
  }

  return nearest;
}

// ============================================================================
// CONVERSIONES Y TRANSFORMACIONES
// ============================================================================

/**
 * Convierte coordenadas internas a LatLngExpression de Leaflet
 * @param coords - Coordenadas internas
 * @returns LatLngExpression de Leaflet
 */
export function toLatLngExpression(coords: Coordinates): LatLngExpression {
  return [coords.lat, coords.lng];
}

/**
 * Convierte LatLng de Leaflet a coordenadas internas
 * @param latLng - LatLng de Leaflet
 * @returns Coordenadas internas
 */
export function fromLatLng(latLng: L.LatLng): Coordinates {
  return {
    lat: latLng.lat,
    lng: latLng.lng,
  };
}

/**
 * Crea bounds de Leaflet desde un array de coordenadas
 * @param points - Array de coordenadas
 * @returns LatLngBounds de Leaflet
 */
export function createBoundsFromPoints(points: Coordinates[]): LatLngBounds {
  if (points.length === 0) {
    throw new Error('No se pueden crear bounds sin puntos');
  }

  const latLngs = points.map(toLatLngExpression);
  return L.latLngBounds(latLngs);
}

/**
 * Expande bounds para incluir un padding
 * @param bounds - Bounds originales
 * @param paddingRatio - Ratio de padding (0.1 = 10%)
 * @returns Bounds expandidos
 */
export function expandBounds(
  bounds: LatLngBounds,
  paddingRatio: number = 0.1
): LatLngBounds {
  return bounds.pad(paddingRatio);
}

// ============================================================================
// FILTRADO Y AGRUPACIÓN
// ============================================================================

/**
 * Filtra alertas dentro de un radio desde un punto
 * @param alerts - Array de alertas
 * @param center - Centro del radio
 * @param radiusMeters - Radio en metros
 * @returns Alertas dentro del radio
 */
export function filterAlertsInRadius(
  alerts: RoadAlert[],
  center: Coordinates,
  radiusMeters: number
): RoadAlert[] {
  return alerts.filter((alert) =>
    isWithinRadius({ lat: alert.latitude, lng: alert.longitude }, center, radiusMeters)
  );
}

/**
 * Ordena alertas por distancia desde un punto
 * @param alerts - Array de alertas
 * @param from - Punto de referencia
 * @returns Alertas ordenadas por distancia (más cercana primero)
 */
export function sortAlertsByDistance(
  alerts: RoadAlert[],
  from: Coordinates
): RoadAlert[] {
  return [...alerts].sort((a, b) => {
    const distA = calculateDistance(from, { lat: a.latitude, lng: a.longitude });
    const distB = calculateDistance(from, { lat: b.latitude, lng: b.longitude });
    return distA - distB;
  });
}

/**
 * Agrupa alertas por municipio
 * @param alerts - Array de alertas
 * @returns Mapa de municipio -> alertas
 */
export function groupAlertsByMunicipality(
  alerts: RoadAlert[]
): Map<string, RoadAlert[]> {
  const grouped = new Map<string, RoadAlert[]>();

  alerts.forEach((alert) => {
    const municipality = alert.municipality || 'Desconocido';
    const existing = grouped.get(municipality) || [];
    grouped.set(municipality, [...existing, alert]);
  });

  return grouped;
}

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea coordenadas para mostrar
 * @param coords - Coordenadas
 * @param decimals - Número de decimales
 * @returns Coordenadas formateadas
 */
export function formatCoordinates(coords: Coordinates, decimals: number = 6): string {
  return `${coords.lat.toFixed(decimals)}, ${coords.lng.toFixed(decimals)}`;
}

/**
 * Obtiene el nombre de dirección cardinal desde un rumbo
 * @param bearing - Rumbo en grados (0-360)
 * @returns Nombre de la dirección (N, NE, E, SE, S, SW, W, NW)
 */
export function getCardinalDirection(bearing: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
  const index = Math.round(((bearing % 360) / 45) % 8);
  return directions[index];
}

/**
 * Formatea distancia en formato legible
 * @param meters - Distancia en metros
 * @returns Distancia formateada
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

// ============================================================================
// ZOOM Y VIEWPORT
// ============================================================================

/**
 * Calcula el nivel de zoom apropiado para ver un área
 * @param bounds - Límites del área
 * @param mapSize - Tamaño del mapa en píxeles
 * @returns Nivel de zoom sugerido
 */
export function calculateZoomLevel(
  bounds: LatLngBounds,
  mapSize: { width: number; height: number }
): number {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 18;

  function latRad(lat: number): number {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx: number, worldPx: number, fraction: number): number {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

  const lngDiff = ne.lng - sw.lng;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(mapSize.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(mapSize.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

/**
 * Ajusta el mapa para mostrar todos los puntos con padding
 * @param map - Instancia del mapa de Leaflet
 * @param points - Puntos a mostrar
 * @param options - Opciones de ajuste
 */
export function fitMapToPoints(
  map: L.Map,
  points: Coordinates[],
  options: { padding?: number; maxZoom?: number; animate?: boolean } = {}
): void {
  if (points.length === 0) return;

  const bounds = createBoundsFromPoints(points);

  map.fitBounds(bounds, {
    padding: [options.padding || 50, options.padding || 50],
    maxZoom: options.maxZoom || 16,
    animate: options.animate !== false,
  });
}

// ============================================================================
// VALIDACIÓN
// ============================================================================

/**
 * Valida si unas coordenadas están dentro de los límites de Nariño
 * @param coords - Coordenadas a validar
 * @returns true si están dentro de Nariño
 */
export function isInNarino(coords: Coordinates): boolean {
  const [sw, ne] = NARINO_BOUNDS;
  return (
    coords.lat >= sw[0] &&
    coords.lat <= ne[0] &&
    coords.lng >= sw[1] &&
    coords.lng <= ne[1]
  );
}

/**
 * Valida que las coordenadas sean válidas
 * @param coords - Coordenadas a validar
 * @returns true si son válidas
 */
export function isValidCoordinates(coords: any): coords is Coordinates {
  return (
    coords &&
    typeof coords.lat === 'number' &&
    typeof coords.lng === 'number' &&
    coords.lat >= -90 &&
    coords.lat <= 90 &&
    coords.lng >= -180 &&
    coords.lng <= 180
  );
}
