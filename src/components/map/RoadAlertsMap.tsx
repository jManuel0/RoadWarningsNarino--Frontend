/**
 * ============================================================================
 * COMPONENTE PRINCIPAL: RoadAlertsMap
 * ============================================================================
 *
 * Mapa interactivo completo para alertas viales del departamento de Nariño
 *
 * CARACTERÍSTICAS:
 * - Mapa centrado en Pasto, Nariño con OpenStreetMap
 * - Ubicación del usuario en tiempo real con seguimiento GPS
 * - Visualización de alertas viales con iconos personalizados
 * - Clustering automático de alertas cuando hay muchas
 * - Cálculo de rutas usando OSRM (Open Source Routing Machine)
 * - Navegación paso a paso con instrucciones
 * - Manejo de errores robusto
 * - Actualización automática de alertas cada 10 segundos
 * - Totalmente responsive y optimizado
 *
 * TECNOLOGÍAS:
 * - React + TypeScript
 * - Leaflet (mapas raster)
 * - OpenStreetMap (tiles gratuitos)
 * - OSRM (rutas gratuitas)
 * - Geolocation API del navegador
 *
 * @author Sistema de Mapas Geoespaciales
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Importaciones de servicios y utilidades
import { useGeolocation } from "@/hooks/useGeolocation";
import {
  calculateRoute,
  formatDistance,
  formatDuration,
} from "@/services/osrmService";
import {
  createAlertIcon,
  createUserLocationIcon,
  createWaypointIcon,
  injectMapIconStyles,
} from "@/utils/mapIcons";
import {
  PASTO_CENTER,
  NARINO_BOUNDS,
  calculateDistance,
  fitMapToPoints,
  toLatLngExpression,
} from "@/utils/mapHelpers";

// Importaciones de tipos (mapa)
import {
  Coordinates,
  Route,
  RoadAlert,
  AlertType,
  AlertSeverity,
  AlertStatus,
} from "@/types/map.types";

// Tipos del backend
import {
  Alert as BackendAlert,
  AlertType as BackendAlertType,
  AlertSeverity as BackendAlertSeverity,
  AlertStatus as BackendAlertStatus,
} from "@/types/Alert";

// API del backend
import { alertApi } from "@/api/alertApi";

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface RoadAlertsMapProps {
  /**
   * Altura del mapa (CSS)
   */
  height?: string;

  /**
   * Mostrar controles de navegación
   */
  showControls?: boolean;

  /**
   * Habilitar clustering de alertas
   */
  enableClustering?: boolean;

  /**
   * Intervalo de actualización de alertas (ms)
   */
  updateInterval?: number;

  /**
   * Callback cuando se selecciona una alerta
   */
  onAlertClick?: (alert: RoadAlert) => void;

  /**
   * Callback cuando se calcula una ruta
   */
  onRouteCalculated?: (route: Route) => void;

  /**
   * Modo oscuro
   */
  darkMode?: boolean;
}

interface MapState {
  alerts: RoadAlert[];
  selectedAlert: RoadAlert | null;
  currentRoute: Route | null;
  routeOrigin: Coordinates | null;
  routeDestination: Coordinates | null;
  isLoadingRoute: boolean;
  isLoadingAlerts: boolean;
  error: string | null;
}

// ============================================================================
// HELPERS: Mapping Alert (backend) → RoadAlert (mapa)
// ============================================================================

const mapBackendTypeToMapType = (type: BackendAlertType): AlertType => {
  switch (type) {
    case BackendAlertType.DERRUMBE:
      return AlertType.DERRUMBE;
    case BackendAlertType.ACCIDENTE:
      return AlertType.ACCIDENTE;
    case BackendAlertType.INUNDACION:
      return AlertType.INUNDACION;
    case BackendAlertType.CIERRE_VIAL:
      return AlertType.VIA_CERRADA;
    case BackendAlertType.MANTENIMIENTO:
      return AlertType.OBRAS_VIALES;
    default:
      return AlertType.OTROS;
  }
};

const mapBackendSeverityToMapSeverity = (
  severity: BackendAlertSeverity
): AlertSeverity => {
  switch (severity) {
    case BackendAlertSeverity.BAJA:
      return AlertSeverity.BAJA;
    case BackendAlertSeverity.MEDIA:
      return AlertSeverity.MEDIA;
    case BackendAlertSeverity.ALTA:
      return AlertSeverity.ALTA;
    case BackendAlertSeverity.CRITICA:
      return AlertSeverity.CRITICA;
    default:
      return AlertSeverity.MEDIA;
  }
};

const mapBackendStatusToMapStatus = (
  status: BackendAlertStatus
): AlertStatus => {
  switch (status) {
    case BackendAlertStatus.ACTIVE:
      return AlertStatus.ACTIVA;
    case BackendAlertStatus.RESOLVED:
      return AlertStatus.RESUELTA;
    case BackendAlertStatus.EXPIRED:
      return AlertStatus.EXPIRADA;
    case BackendAlertStatus.IN_PROGRESS:
      return AlertStatus.EN_REVISION;
    default:
      return AlertStatus.ACTIVA;
  }
};

const toRoadAlert = (alert: BackendAlert): RoadAlert => ({
  id: alert.id,
  type: mapBackendTypeToMapType(alert.type),
  title: alert.title,
  description: alert.description,
  latitude: alert.latitude,
  longitude: alert.longitude,
  location: alert.location,
  municipality: alert.municipality,
  severity: mapBackendSeverityToMapSeverity(alert.severity),
  status: mapBackendStatusToMapStatus(alert.status),
  username: alert.username ?? "Anónimo",
  userId: alert.userId ?? 0,
  imageUrl: alert.imageUrl,
  upvotes: alert.upvotes ?? 0,
  downvotes: alert.downvotes ?? 0,
  createdAt: alert.createdAt ?? new Date().toISOString(),
  updatedAt: alert.updatedAt,
  expiresAt: alert.expiresAt,
});

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const RoadAlertsMap: React.FC<RoadAlertsMapProps> = ({
  height = "100vh",
  showControls = true,
  enableClustering = false,
  updateInterval = 10000, // 10 segundos
  onAlertClick,
  onRouteCalculated,
  darkMode = false,
}) => {
  // =========================================================================
  // ESTADO
  // =========================================================================

  const [mapState, setMapState] = useState<MapState>({
    alerts: [],
    selectedAlert: null,
    currentRoute: null,
    routeOrigin: null,
    routeDestination: null,
    isLoadingRoute: false,
    isLoadingAlerts: true,
    error: null,
  });

  // Hook de geolocalización
  const {
    position: userPosition,
    isTracking,
    startTracking,
    stopTracking,
    isSupported: isGeoSupported,
  } = useGeolocation({
    onPosition: (pos) => console.log("📍 Ubicación actualizada:", pos),
    onError: (err) =>
      console.error("⚠️ Error de geolocalización:", err.message),
  });

  // Referencias
  const mapRef = useRef<L.Map | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // =========================================================================
  // EFECTOS
  // =========================================================================

  /**
   * Inyectar estilos CSS para los iconos personalizados
   */
  useEffect(() => {
    injectMapIconStyles();
  }, []);

  /**
   * Iniciar seguimiento de ubicación al montar
   */
  useEffect(() => {
    if (isGeoSupported) {
      startTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isGeoSupported, startTracking, stopTracking]);

  /**
   * Cargar alertas inicialmente y configurar actualización automática
   */
  useEffect(() => {
    loadAlerts();

    // Configurar actualización periódica
    if (updateInterval > 0) {
      updateTimerRef.current = setInterval(() => {
        loadAlerts();
      }, updateInterval);
    }

    return () => {
      if (updateTimerRef.current) {
        clearInterval(updateTimerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateInterval]);

  // =========================================================================
  // FUNCIONES DE DATOS
  // =========================================================================

  /**
   * Carga las alertas desde el backend
   */
  const loadAlerts = useCallback(async () => {
    try {
      setMapState((prev) => ({ ...prev, isLoadingAlerts: true, error: null }));

      const alerts = await alertApi.getAlerts();

      // Filtrar solo alertas activas (status del backend)
      const activeAlerts = alerts.filter(
        (alert) => alert.status === BackendAlertStatus.ACTIVE
      );

      // Convertir a RoadAlert (tipos del mapa)
      const roadAlerts: RoadAlert[] = activeAlerts.map(toRoadAlert);

      setMapState((prev) => ({
        ...prev,
        alerts: roadAlerts,
        isLoadingAlerts: false,
      }));

      console.log(`✅ ${roadAlerts.length} alertas cargadas`);
    } catch (error) {
      console.error("Error cargando alertas:", error);
      setMapState((prev) => ({
        ...prev,
        isLoadingAlerts: false,
        error: "No se pudieron cargar las alertas",
      }));
    }
  }, []);

  /**
   * Calcula ruta desde origen a destino
   */
  const handleCalculateRoute = useCallback(
    async (origin: Coordinates, destination: Coordinates) => {
      try {
        setMapState((prev) => ({ ...prev, isLoadingRoute: true, error: null }));

        console.log("🧭 Calculando ruta...");

        const route = await calculateRoute(origin, destination);

        setMapState((prev) => ({
          ...prev,
          currentRoute: route,
          routeOrigin: origin,
          routeDestination: destination,
          isLoadingRoute: false,
        }));

        // Ajustar mapa para mostrar la ruta completa
        if (mapRef.current && route.geometry.length > 0) {
          const routePoints = route.geometry.map((point) => {
            const [lat, lng] = point as [number, number];
            return { lat, lng };
          });
          fitMapToPoints(mapRef.current, routePoints, { padding: 50 });
        }

        onRouteCalculated?.(route);

        console.log("✅ Ruta calculada:", {
          distance: formatDistance(route.distance),
          duration: formatDuration(route.duration),
        });
      } catch (error) {
        console.error("Error calculando ruta:", error);
        setMapState((prev) => ({
          ...prev,
          isLoadingRoute: false,
          error:
            error instanceof Error ? error.message : "Error calculando ruta",
        }));
      }
    },
    [onRouteCalculated]
  );

  /**
   * Navega hacia una alerta desde la ubicación actual
   */
  const handleNavigateToAlert = useCallback(
    (roadAlert: RoadAlert) => {
      if (!userPosition) {
        window.alert("Por favor, habilita tu ubicación para navegar");
        return;
      }

      const destination: Coordinates = {
        lat: roadAlert.latitude,
        lng: roadAlert.longitude,
      };

      handleCalculateRoute(userPosition, destination);
      setMapState((prev) => ({ ...prev, selectedAlert: roadAlert }));
    },
    [userPosition, handleCalculateRoute]
  );

  /**
   * Limpia la ruta actual
   */
  const handleClearRoute = useCallback(() => {
    setMapState((prev) => ({
      ...prev,
      currentRoute: null,
      routeOrigin: null,
      routeDestination: null,
      selectedAlert: null,
    }));
  }, []);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="relative w-full" style={{ height }}>
      {/* Indicador de carga */}
      {mapState.isLoadingAlerts && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Cargando alertas...
            </span>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {mapState.error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">⚠️ {mapState.error}</span>
            <button
              onClick={() => setMapState((prev) => ({ ...prev, error: null }))}
              className="ml-2 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Panel de información de ruta */}
      {mapState.currentRoute && showControls && (
        <RouteInfoPanel
          route={mapState.currentRoute}
          onClear={handleClearRoute}
          isLoading={mapState.isLoadingRoute}
        />
      )}

      {/* Controles del mapa */}
      {showControls && (
        <MapControls
          isTracking={isTracking}
          onToggleTracking={() =>
            isTracking ? stopTracking() : startTracking()
          }
          onClearRoute={handleClearRoute}
          hasRoute={!!mapState.currentRoute}
          alertsCount={mapState.alerts.length}
          onRefreshAlerts={loadAlerts}
        />
      )}

      {/* Mapa de Leaflet */}
      <MapContainer
        center={toLatLngExpression(PASTO_CENTER)}
        zoom={13}
        maxBounds={NARINO_BOUNDS}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
        data-enable-clustering={enableClustering ? "true" : "false"}
        ref={(map) => {
          if (map) mapRef.current = map;
        }}
      >
        {/* Capa de tiles de OpenStreetMap */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url={
            darkMode
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
          maxZoom={19}
          detectRetina={true}
        />

        {/* Marcador de ubicación del usuario */}
        {userPosition && (
          <Marker
            position={toLatLngExpression(userPosition)}
            icon={createUserLocationIcon()}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-sm">
                <strong>Tu ubicación</strong>
                <br />
                Lat: {userPosition.lat.toFixed(6)}
                <br />
                Lng: {userPosition.lng.toFixed(6)}
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de alertas */}
        {mapState.alerts.map((alert) => (
          <Marker
            key={alert.id}
            position={[alert.latitude, alert.longitude]}
            icon={createAlertIcon(alert.type, alert.severity)}
            eventHandlers={{
              click: () => {
                setMapState((prev) => ({ ...prev, selectedAlert: alert }));
                onAlertClick?.(alert);
              },
            }}
          >
            <Popup maxWidth={300}>
              <AlertPopupContent
                alert={alert}
                userPosition={userPosition}
                onNavigate={() => handleNavigateToAlert(alert)}
              />
            </Popup>
          </Marker>
        ))}

        {/* Marcadores de origen y destino */}
        {mapState.routeOrigin && (
          <Marker
            position={toLatLngExpression(mapState.routeOrigin)}
            icon={createWaypointIcon("origin")}
          />
        )}

        {mapState.routeDestination && (
          <Marker
            position={toLatLngExpression(mapState.routeDestination)}
            icon={createWaypointIcon("destination")}
          />
        )}

        {/* Polilínea de la ruta */}
        {mapState.currentRoute && (
          <Polyline
            positions={mapState.currentRoute.geometry}
            color="#3b82f6"
            weight={5}
            opacity={0.8}
            smoothFactor={1}
          />
        )}

        {/* Componente auxiliar para eventos del mapa */}
        <MapEventHandler />
      </MapContainer>
    </div>
  );
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Panel de información de ruta
 */
const RouteInfoPanel: React.FC<{
  route: Route;
  onClear: () => void;
  isLoading: boolean;
}> = ({ route, onClear, isLoading }) => (
  <div className="absolute top-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-sm">
    <div className="flex items-start justify-between mb-2">
      <h3 className="font-semibold text-gray-900 dark:text-white">Ruta</h3>
      <button
        onClick={onClear}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        title="Limpiar ruta"
      >
        ✕
      </button>
    </div>

    {isLoading && (
      <div className="mb-2 text-xs text-blue-600">Calculando ruta...</div>
    )}

    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
      <div className="flex items-center gap-2">
        <span className="font-medium">📏 Distancia:</span>
        <span>{formatDistance(route.distance)}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="font-medium">🕒 Duración:</span>
        <span>{formatDuration(route.duration)}</span>
      </div>

      {route.legs.length > 0 && (
        <div className="mt-4">
          <div className="font-medium mb-2">Instrucciones:</div>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {route.legs[0].steps.slice(0, 5).map((step, index) => (
              <div key={index} className="text-xs flex gap-2">
                <span className="text-gray-500">{index + 1}.</span>
                <span>{step.instruction}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

/**
 * Controles del mapa
 */
const MapControls: React.FC<{
  isTracking: boolean;
  onToggleTracking: () => void;
  onClearRoute: () => void;
  hasRoute: boolean;
  alertsCount: number;
  onRefreshAlerts: () => void;
}> = ({
  isTracking,
  onToggleTracking,
  onClearRoute,
  hasRoute,
  alertsCount,
  onRefreshAlerts,
}) => (
  <div className="absolute bottom-4 left-4 z-[1000] flex flex-col gap-2">
    {/* Botón de ubicación */}
    <button
      onClick={onToggleTracking}
      className={`p-3 rounded-lg shadow-lg ${
        isTracking
          ? "bg-blue-600 text-white"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
      } hover:opacity-90 transition-opacity`}
      title={isTracking ? "Detener seguimiento" : "Seguir mi ubicación"}
    >
      📍
    </button>

    {/* Botón para refrescar alertas */}
    <button
      onClick={onRefreshAlerts}
      className="p-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
      title="Actualizar alertas"
    >
      🔄
    </button>

    {/* Contador de alertas */}
    <div className="px-3 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow-lg text-sm font-medium">
      🚨 {alertsCount}
    </div>

    {/* Botón para limpiar ruta */}
    {hasRoute && (
      <button
        onClick={onClearRoute}
        className="p-3 bg-red-600 text-white rounded-lg shadow-lg hover:opacity-90 transition-opacity"
        title="Limpiar ruta"
      >
        🗑️
      </button>
    )}
  </div>
);

/**
 * Contenido del popup de alerta
 */
const AlertPopupContent: React.FC<{
  alert: RoadAlert;
  userPosition: Coordinates | null;
  onNavigate: () => void;
}> = ({ alert, userPosition, onNavigate }) => {
  const distance = userPosition
    ? calculateDistance(userPosition, {
        lat: alert.latitude,
        lng: alert.longitude,
      })
    : null;

  return (
    <div className="space-y-2">
      <div>
        <h3 className="font-bold text-base">{alert.title}</h3>
        <p className="text-sm text-gray-600">{alert.description}</p>
      </div>

      <div className="text-xs space-y-1">
        <div>
          <strong>Tipo:</strong> {alert.type}
        </div>
        <div>
          <strong>Severidad:</strong>{" "}
          <span
            className={`font-semibold ${
              alert.severity === "CRITICAL"
                ? "text-red-600"
                : alert.severity === "HIGH"
                  ? "text-orange-600"
                  : alert.severity === "MEDIUM"
                    ? "text-yellow-600"
                    : "text-green-600"
            }`}
          >
            {alert.severity}
          </span>
        </div>
        <div>
          <strong>Ubicación:</strong> {alert.location}
        </div>
        {distance && (
          <div>
            <strong>Distancia:</strong> {formatDistance(distance)}
          </div>
        )}
      </div>

      {userPosition && (
        <button
          onClick={onNavigate}
          className="w-full mt-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          🚗 Navegar hasta aquí
        </button>
      )}
    </div>
  );
};

/**
 * Manejador de eventos del mapa
 */
const MapEventHandler: React.FC = () => {
  const map = useMapEvents({
    click: (e) => {
      console.log("Clic en mapa:", e.latlng);
    },
    zoomend: () => {
      console.log("Zoom actual:", map.getZoom());
    },
  });

  return null;
};

export default RoadAlertsMap;
