/**
 * Servicio de Enrutamiento usando OSRM (Open Source Routing Machine)
 * Proporciona funciones para calcular rutas, obtener instrucciones y más
 *
 * API Pública OSRM: https://router.project-osrm.org
 * Documentación: http://project-osrm.org/docs/v5.24.0/api/
 */

import { LatLngExpression } from 'leaflet';
import {
  Coordinates,
  Route,
  RouteOptions,
  OSRMResponse,
  RouteStep,
  RouteLeg,
} from '@/types/map.types';

// ============================================================================
// CONFIGURACIÓN
// ============================================================================

/**
 * URL base del servidor OSRM público
 * Nota: En producción, considera usar tu propio servidor OSRM
 */
const OSRM_BASE_URL = 'https://router.project-osrm.org';

/**
 * Timeout para las peticiones HTTP (en milisegundos)
 */
const REQUEST_TIMEOUT = 10000; // 10 segundos

/**
 * Opciones por defecto para el cálculo de rutas
 */
const DEFAULT_ROUTE_OPTIONS: Partial<RouteOptions> = {
  alternatives: false,
  steps: true,
  geometries: 'geojson',
  overview: 'full',
  annotations: false,
};

// ============================================================================
// FUNCIONES PRINCIPALES
// ============================================================================

/**
 * Calcula una ruta entre origen y destino
 * @param origin - Coordenadas del punto de origen
 * @param destination - Coordenadas del punto de destino
 * @param options - Opciones adicionales para la ruta
 * @returns Promesa con la ruta calculada
 * @throws Error si OSRM no puede calcular la ruta
 */
export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates,
  options: Partial<RouteOptions> = {}
): Promise<Route> {
  try {
    // Validar coordenadas
    validateCoordinates(origin);
    validateCoordinates(destination);

    // Construir URL de OSRM
    const url = buildOSRMUrl(origin, destination, options);

    console.log('🗺️ Calculando ruta OSRM:', { origin, destination, url });

    // Hacer petición con timeout
    const response = await fetchWithTimeout(url, REQUEST_TIMEOUT);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
    }

    const data: OSRMResponse = await response.json();

    // Validar respuesta de OSRM
    if (data.code !== 'Ok') {
      throw new Error(
        data.message || `OSRM devolvió código de error: ${data.code}`
      );
    }

    if (!data.routes || data.routes.length === 0) {
      throw new Error('OSRM no encontró ninguna ruta');
    }

    // Procesar la ruta
    const route = processOSRMRoute(data.routes[0]);

    console.log('✅ Ruta calculada exitosamente:', {
      distance: `${(route.distance / 1000).toFixed(2)} km`,
      duration: `${Math.round(route.duration / 60)} min`,
    });

    return route;
  } catch (error) {
    console.error('❌ Error calculando ruta:', error);
    throw new Error(
      `No se pudo calcular la ruta: ${
        error instanceof Error ? error.message : 'Error desconocido'
      }`
    );
  }
}

/**
 * Calcula múltiples rutas alternativas
 * @param origin - Coordenadas del punto de origen
 * @param destination - Coordenadas del punto de destino
 * @param maxAlternatives - Número máximo de rutas alternativas (1-3)
 * @returns Promesa con array de rutas alternativas
 */
export async function calculateAlternativeRoutes(
  origin: Coordinates,
  destination: Coordinates,
  maxAlternatives: number = 2
): Promise<Route[]> {
  try {
    const url = buildOSRMUrl(origin, destination, {
      alternatives: true,
      steps: true,
      geometries: 'geojson',
      overview: 'full',
    });

    const response = await fetchWithTimeout(url, REQUEST_TIMEOUT);
    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes) {
      throw new Error('No se pudieron calcular rutas alternativas');
    }

    // Procesar todas las rutas (limitado por maxAlternatives)
    return data.routes
      .slice(0, maxAlternatives + 1)
      .map((route) => processOSRMRoute(route));
  } catch (error) {
    console.error('Error calculando rutas alternativas:', error);
    // En caso de error, intentar calcular al menos la ruta principal
    const mainRoute = await calculateRoute(origin, destination);
    return [mainRoute];
  }
}

/**
 * Calcula una ruta pasando por múltiples waypoints
 * @param waypoints - Array de coordenadas (mínimo 2: origen y destino)
 * @returns Promesa con la ruta que pasa por todos los waypoints
 */
export async function calculateMultiWaypointRoute(
  waypoints: Coordinates[]
): Promise<Route> {
  if (waypoints.length < 2) {
    throw new Error('Se requieren al menos 2 waypoints');
  }

  // Construir coordenadas para OSRM
  const coordinates = waypoints
    .map((wp) => `${wp.lng},${wp.lat}`)
    .join(';');

  const url = `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${new URLSearchParams(
    {
      steps: 'true',
      geometries: 'geojson',
      overview: 'full',
    }
  )}`;

  const response = await fetchWithTimeout(url, REQUEST_TIMEOUT);
  const data: OSRMResponse = await response.json();

  if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
    throw new Error('No se pudo calcular la ruta con waypoints');
  }

  return processOSRMRoute(data.routes[0]);
}

// ============================================================================
// FUNCIONES DE PROCESAMIENTO
// ============================================================================

/**
 * Procesa una ruta de OSRM al formato interno
 * @param osrmRoute - Ruta en formato OSRM
 * @returns Ruta en formato interno
 */
function processOSRMRoute(osrmRoute: any): Route {
  // Extraer geometría (coordenadas de la polilínea)
  const geometry: LatLngExpression[] = osrmRoute.geometry.coordinates.map(
    (coord: [number, number]) => [coord[1], coord[0]] as LatLngExpression // OSRM usa [lng, lat], Leaflet usa [lat, lng]
  );

  // Procesar legs (segmentos de la ruta)
  const legs: RouteLeg[] = osrmRoute.legs.map((leg: any) => ({
    distance: leg.distance,
    duration: leg.duration,
    summary: leg.summary || '',
    steps: leg.steps
      ? leg.steps.map((step: any) => processRouteStep(step))
      : [],
  }));

  return {
    distance: osrmRoute.distance,
    duration: osrmRoute.duration,
    geometry,
    legs,
    weight: osrmRoute.weight || osrmRoute.duration,
    weightName: osrmRoute.weight_name || 'duration',
  };
}

/**
 * Procesa un paso de navegación de OSRM
 * @param osrmStep - Paso en formato OSRM
 * @returns Paso en formato interno
 */
function processRouteStep(osrmStep: any): RouteStep {
  return {
    distance: osrmStep.distance,
    duration: osrmStep.duration,
    instruction: generateInstruction(osrmStep),
    name: osrmStep.name || 'Vía sin nombre',
    mode: 'driving',
    maneuver: osrmStep.maneuver
      ? {
          type: osrmStep.maneuver.type,
          modifier: osrmStep.maneuver.modifier,
          location: {
            lat: osrmStep.maneuver.location[1],
            lng: osrmStep.maneuver.location[0],
          },
        }
      : undefined,
  };
}

/**
 * Genera instrucción de navegación en español
 * @param step - Paso de OSRM
 * @returns Instrucción legible
 */
function generateInstruction(step: any): string {
  const { maneuver, name } = step;

  if (!maneuver) return `Continuar por ${name || 'la vía'}`;

  const roadName = name || 'la vía';

  // Mapeo de tipos de maniobra a español
  const maneuverTypes: Record<string, string> = {
    depart: 'Salir',
    arrive: 'Llegar a',
    turn: 'Girar',
    'new name': 'Continuar por',
    continue: 'Continuar',
    merge: 'Incorporarse a',
    'on ramp': 'Tomar la rampa',
    'off ramp': 'Salir por la rampa',
    fork: 'Tomar el desvío',
    'end of road': 'Al final de la vía',
    roundabout: 'En la rotonda',
  };

  // Mapeo de modificadores a español
  const modifiers: Record<string, string> = {
    left: 'a la izquierda',
    right: 'a la derecha',
    'sharp left': 'cerrado a la izquierda',
    'sharp right': 'cerrado a la derecha',
    'slight left': 'ligeramente a la izquierda',
    'slight right': 'ligeramente a la derecha',
    straight: 'recto',
    uturn: 'en U',
  };

  const type = maneuverTypes[maneuver.type] || 'Continuar';
  const modifier = maneuver.modifier ? modifiers[maneuver.modifier] || '' : '';

  if (maneuver.type === 'depart') {
    return `Salir hacia ${roadName}`;
  }

  if (maneuver.type === 'arrive') {
    return `Llegada a ${roadName}`;
  }

  if (maneuver.type === 'roundabout') {
    const exit = maneuver.exit || 1;
    return `En la rotonda, tomar la ${exit}ª salida hacia ${roadName}`;
  }

  return modifier
    ? `${type} ${modifier} hacia ${roadName}`
    : `${type} por ${roadName}`;
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Construye la URL de OSRM con los parámetros necesarios
 * @param origin - Coordenadas de origen
 * @param destination - Coordenadas de destino
 * @param options - Opciones de ruta
 * @returns URL completa de OSRM
 */
function buildOSRMUrl(
  origin: Coordinates,
  destination: Coordinates,
  options: Partial<RouteOptions> = {}
): string {
  const mergedOptions = { ...DEFAULT_ROUTE_OPTIONS, ...options };

  // OSRM espera coordenadas en formato: lng,lat;lng,lat
  const coordinates = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;

  // Construir parámetros de consulta
  const params = new URLSearchParams({
    steps: String(mergedOptions.steps),
    geometries: mergedOptions.geometries!,
    overview: mergedOptions.overview!,
    alternatives: String(mergedOptions.alternatives),
  });

  if (mergedOptions.annotations) {
    params.append('annotations', 'true');
  }

  return `${OSRM_BASE_URL}/route/v1/driving/${coordinates}?${params}`;
}

/**
 * Valida que las coordenadas sean válidas
 * @param coords - Coordenadas a validar
 * @throws Error si las coordenadas no son válidas
 */
function validateCoordinates(coords: Coordinates): void {
  if (!coords || typeof coords.lat !== 'number' || typeof coords.lng !== 'number') {
    throw new Error('Coordenadas inválidas');
  }

  if (coords.lat < -90 || coords.lat > 90) {
    throw new Error(`Latitud inválida: ${coords.lat} (debe estar entre -90 y 90)`);
  }

  if (coords.lng < -180 || coords.lng > 180) {
    throw new Error(`Longitud inválida: ${coords.lng} (debe estar entre -180 y 180)`);
  }
}

/**
 * Fetch con timeout
 * @param url - URL a consultar
 * @param timeout - Timeout en milisegundos
 * @returns Promesa con la respuesta
 */
async function fetchWithTimeout(
  url: string,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Timeout: La solicitud tardó demasiado');
    }
    throw error;
  }
}

// ============================================================================
// UTILIDADES DE FORMATO
// ============================================================================

/**
 * Formatea la distancia en km o metros
 * @param meters - Distancia en metros
 * @returns Distancia formateada
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formatea la duración en horas, minutos y segundos
 * @param seconds - Duración en segundos
 * @returns Duración formateada
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  if (minutes > 0) {
    return `${minutes} min`;
  }

  return `${Math.round(seconds)} seg`;
}

/**
 * Calcula la hora de llegada estimada
 * @param durationSeconds - Duración del viaje en segundos
 * @returns Hora de llegada formateada
 */
export function calculateETA(durationSeconds: number): string {
  const now = new Date();
  const eta = new Date(now.getTime() + durationSeconds * 1000);

  return eta.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Obtiene un resumen de la ruta
 * @param route - Ruta calculada
 * @returns Resumen legible
 */
export function getRouteSummary(route: Route): string {
  const distance = formatDistance(route.distance);
  const duration = formatDuration(route.duration);
  const eta = calculateETA(route.duration);

  return `${distance} · ${duration} · Llegada: ${eta}`;
}
