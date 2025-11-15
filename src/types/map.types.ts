/**
 * Tipos y interfaces para el sistema de mapas geoespaciales
 * Incluye definiciones para rutas, alertas, marcadores y configuración del mapa
 */

import { LatLngExpression } from 'leaflet';

// ============================================================================
// TIPOS DE COORDENADAS Y UBICACIÓN
// ============================================================================

/**
 * Coordenadas geográficas (latitud, longitud)
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Ubicación con coordenadas y nombre descriptivo
 */
export interface Location extends Coordinates {
  name?: string;
  address?: string;
}

/**
 * Bounds del mapa (límites geográficos)
 */
export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ============================================================================
// TIPOS DE RUTAS Y NAVEGACIÓN
// ============================================================================

/**
 * Paso individual en las instrucciones de navegación
 */
export interface RouteStep {
  distance: number; // Distancia en metros
  duration: number; // Duración en segundos
  instruction: string; // Instrucción textual
  name: string; // Nombre de la vía
  mode: 'driving' | 'walking' | 'cycling';
  maneuver?: {
    type: string; // 'turn', 'new name', 'depart', 'arrive', etc.
    modifier?: string; // 'left', 'right', 'straight', etc.
    location: Coordinates;
  };
}

/**
 * Segmento de ruta (leg) - parte de la ruta entre dos waypoints
 */
export interface RouteLeg {
  distance: number; // Distancia total en metros
  duration: number; // Duración total en segundos
  steps: RouteStep[];
  summary: string;
}

/**
 * Ruta completa calculada por OSRM
 */
export interface Route {
  distance: number; // Distancia total en metros
  duration: number; // Duración total en segundos
  geometry: LatLngExpression[]; // Coordenadas de la polilínea
  legs: RouteLeg[];
  weight: number; // Peso de la ruta (usado por OSRM para optimización)
  weightName: string;
}

/**
 * Respuesta de la API de OSRM
 */
export interface OSRMResponse {
  code: 'Ok' | 'NoRoute' | 'NoSegment' | 'Error';
  routes: Route[];
  waypoints: Array<{
    hint: string;
    distance: number;
    name: string;
    location: [number, number]; // [lng, lat] - OSRM usa [lng, lat]
  }>;
  message?: string; // Mensaje de error si code !== 'Ok'
}

/**
 * Opciones para el cálculo de rutas
 */
export interface RouteOptions {
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Coordinates[]; // Puntos intermedios
  alternatives?: boolean; // Calcular rutas alternativas
  steps?: boolean; // Incluir pasos detallados
  geometries?: 'polyline' | 'polyline6' | 'geojson'; // Formato de geometría
  overview?: 'full' | 'simplified' | 'false'; // Nivel de detalle
  annotations?: boolean; // Incluir anotaciones (velocidad, duración, etc.)
}

// ============================================================================
// TIPOS DE ALERTAS
// ============================================================================

/**
 * Tipos de alertas viales disponibles
 */
export enum AlertType {
  ACCIDENTE = 'ACCIDENTE',
  DERRUMBE = 'DERRUMBE',
  INUNDACION = 'INUNDACION',
  VIA_CERRADA = 'VIA_CERRADA',
  OBRAS_VIALES = 'OBRAS_VIALES',
  NEBLINA = 'NEBLINA',
  TRAFICO_PESADO = 'TRAFICO_PESADO',
  VEHICULO_VARADO = 'VEHICULO_VARADO',
  POLICIA = 'POLICIA',
  PROTESTA = 'PROTESTA',
  ANIMALES_EN_VIA = 'ANIMALES_EN_VIA',
  SEMAFORO_DANADO = 'SEMAFORO_DANADO',
  OTROS = 'OTROS',
}

/**
 * Severidad de la alerta
 */
export enum AlertSeverity {
  BAJA = 'LOW',
  MEDIA = 'MEDIUM',
  ALTA = 'HIGH',
  CRITICA = 'CRITICAL',
}

/**
 * Estado de la alerta
 */
export enum AlertStatus {
  ACTIVA = 'ACTIVE',
  RESUELTA = 'RESOLVED',
  EXPIRADA = 'EXPIRED',
  EN_REVISION = 'UNDER_REVIEW',
  RECHAZADA = 'REJECTED',
}

/**
 * Alerta vial completa
 */
export interface RoadAlert {
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
  username: string;
  userId: number;
  imageUrl?: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
}

// ============================================================================
// TIPOS DE MARCADORES DEL MAPA
// ============================================================================

/**
 * Tipo de marcador en el mapa
 */
export enum MarkerType {
  USER_LOCATION = 'USER_LOCATION',
  ALERT = 'ALERT',
  ORIGIN = 'ORIGIN',
  DESTINATION = 'DESTINATION',
  WAYPOINT = 'WAYPOINT',
  GAS_STATION = 'GAS_STATION',
}

/**
 * Configuración de un marcador
 */
export interface MapMarker {
  id: string | number;
  type: MarkerType;
  position: Coordinates;
  title?: string;
  description?: string;
  icon?: string;
  popup?: string | React.ReactNode;
  draggable?: boolean;
  onClick?: () => void;
  data?: any; // Datos adicionales asociados al marcador
}

// ============================================================================
// CONFIGURACIÓN DEL MAPA
// ============================================================================

/**
 * Configuración inicial del mapa
 */
export interface MapConfig {
  center: Coordinates;
  zoom: number;
  minZoom?: number;
  maxZoom?: number;
  maxBounds?: [[number, number], [number, number]];
  zoomControl?: boolean;
  attributionControl?: boolean;
}

/**
 * Opciones de visualización del mapa
 */
export interface MapDisplayOptions {
  showUserLocation: boolean;
  showAlerts: boolean;
  showRoute: boolean;
  clusterAlerts: boolean;
  autoUpdateAlerts: boolean;
  updateInterval: number; // En milisegundos
  darkMode: boolean;
}

/**
 * Estilo de la ruta en el mapa
 */
export interface RouteStyle {
  color: string;
  weight: number;
  opacity: number;
  dashArray?: string;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'miter' | 'round' | 'bevel';
}

// ============================================================================
// TIPOS DE EVENTOS DEL MAPA
// ============================================================================

/**
 * Evento de clic en el mapa
 */
export interface MapClickEvent {
  coordinates: Coordinates;
  originalEvent: MouseEvent;
}

/**
 * Evento de clic en una alerta
 */
export interface AlertClickEvent {
  alert: RoadAlert;
  coordinates: Coordinates;
}

/**
 * Evento de cambio de ruta
 */
export interface RouteChangeEvent {
  route: Route | null;
  origin: Coordinates | null;
  destination: Coordinates | null;
}

// ============================================================================
// TIPOS DE ESTADO DEL MAPA
// ============================================================================

/**
 * Estado de navegación
 */
export interface NavigationState {
  isNavigating: boolean;
  currentRoute: Route | null;
  origin: Location | null;
  destination: Location | null;
  waypoints: Location[];
  currentStep: number;
  distanceToNextStep: number;
  timeToDestination: number;
}

/**
 * Estado de geolocalización del usuario
 */
export interface GeolocationState {
  position: Coordinates | null;
  accuracy: number | null;
  heading: number | null; // Dirección en grados (0-360)
  speed: number | null; // Velocidad en m/s
  error: GeolocationPositionError | null;
  isTracking: boolean;
  lastUpdate: Date | null;
}

/**
 * Estado de carga del mapa
 */
export interface MapLoadingState {
  isLoadingRoute: boolean;
  isLoadingAlerts: boolean;
  isLoadingUserLocation: boolean;
  error: string | null;
}

// ============================================================================
// UTILIDADES Y HELPERS
// ============================================================================

/**
 * Resultado del cálculo de distancia entre dos puntos
 */
export interface DistanceResult {
  distance: number; // En metros
  bearing: number; // Rumbo en grados (0-360)
}

/**
 * Configuración del cluster de marcadores
 */
export interface ClusterConfig {
  maxClusterRadius: number;
  disableClusteringAtZoom: number;
  spiderfyOnMaxZoom: boolean;
  showCoverageOnHover: boolean;
  zoomToBoundsOnClick: boolean;
  iconCreateFunction?: (cluster: any) => L.DivIcon;
}

/**
 * Configuración de tiles del mapa
 */
export interface TileLayerConfig {
  url: string;
  attribution: string;
  maxZoom: number;
  minZoom?: number;
  subdomains?: string[];
  detectRetina?: boolean;
}

/**
 * Proveedor de tiles para el mapa
 */
export enum TileProvider {
  OPENSTREETMAP = 'OPENSTREETMAP',
  OPENSTREETMAP_HOT = 'OPENSTREETMAP_HOT',
  CARTO_LIGHT = 'CARTO_LIGHT',
  CARTO_DARK = 'CARTO_DARK',
  ESRI_WORLD_IMAGERY = 'ESRI_WORLD_IMAGERY',
}
