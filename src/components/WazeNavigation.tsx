// src/components/WazeNavigation.tsx
import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Navigation as NavigationIcon,
  X,
  AlertTriangle,
  Route as RouteIcon,
  Clock,
  Gauge,
  Plus,
  Car,
  Construction,
  Waves,
} from "lucide-react";
import { useNavigationStore, Route, RoutePoint } from "@/stores/navigationStore";
import { useAlertStore } from "@/stores/alertStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Alert, AlertSeverity, AlertType } from "@/types/Alert";
import { useMapDarkMode } from "@/hooks/useMapDarkMode";
import { alertApi } from "@/api/alertApi";
import QuickAlertModal from "./QuickAlertModal";

// Iconos personalizados
const userIcon = L.divIcon({
  className: "custom-user-marker",
  html: `<div style="background: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const destinationIcon = L.divIcon({
  className: "custom-destination-marker",
  html: `<div style="background: #ef4444; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Componente para calcular y mostrar rutas
function RouteCalculator({ destination }: { destination: RoutePoint }) {
  const map = useMap();
  const {
    currentLocation,
    setRoutes,
    selectRoute,
    setAlertsNearRoute,
    selectedRoute,
  } = useNavigationStore();
  const alerts = useAlertStore((state) => state.getActiveAlerts());
  const { avoidCriticalAlerts, autoReroute } = useSettingsStore();
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!currentLocation || !destination) return;

    calculateRoutes();
  }, [currentLocation, destination, alerts, avoidCriticalAlerts]);

  const calculateRoutes = async () => {
    if (!currentLocation || !destination) return;

    setCalculating(true);

    try {
      // Calcular ruta directa
      const directRoute = calculateDirectRoute(currentLocation, destination);

      // Calcular rutas alternativas
      const alternativeRoutes = generateAlternativeRoutes(
        currentLocation,
        destination,
        alerts
      );

      // Calcular riesgo para cada ruta
      const routesWithRisk = [directRoute, ...alternativeRoutes].map(
        (route, index) => {
          const riskScore = calculateRouteRisk(route, alerts);
          const alertsOnRoute = findAlertsOnRoute(route, alerts);

          return {
            ...route,
            id: `route-${index}`,
            name: index === 0 ? "Ruta directa" : `Alternativa ${index}`,
            riskScore,
            alertsOnRoute,
            isRecommended: false,
          };
        }
      );

      // Marcar la ruta con menor riesgo como recomendada
      const sortedRoutes = [...routesWithRisk].sort(
        (a, b) => a.riskScore - b.riskScore
      );
      if (sortedRoutes.length > 0) {
        sortedRoutes[0].isRecommended = true;
      }

      setRoutes(sortedRoutes);

      // Seleccionar automáticamente la ruta recomendada
      if (sortedRoutes.length > 0 && !selectedRoute) {
        selectRoute(sortedRoutes[0]);
      }

      // Verificar si hay alertas críticas en la ruta seleccionada
      if (selectedRoute && autoReroute) {
        const criticalAlerts = selectedRoute.alertsOnRoute.filter(
          (alert) => alert.severity === AlertSeverity.CRITICA
        );
        if (criticalAlerts.length > 0) {
          setAlertsNearRoute(criticalAlerts);
        }
      }
    } catch (error) {
      console.error("Error calculating routes:", error);
    } finally {
      setCalculating(false);
    }
  };

  const calculateDirectRoute = (
    start: RoutePoint,
    end: RoutePoint
  ): Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended"> => {
    const points: RoutePoint[] = [start, end];
    const distance = calculateDistance(start, end);
    const duration = (distance / 50) * 3600; // Asumiendo 50 km/h promedio

    const steps = [
      {
        instruction: `Continúa por ${distance.toFixed(1)} km hacia tu destino`,
        distance,
        duration,
        point: end,
      },
    ];

    return { points, distance, duration, steps };
  };

  const generateAlternativeRoutes = (
    start: RoutePoint,
    end: RoutePoint,
    alerts: Alert[]
  ): Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended">[] => {
    const alternatives: Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended">[] = [];

    // Ruta 1: Desviación hacia el norte
    const northPoint: RoutePoint = {
      lat: (start.lat + end.lat) / 2 + 0.01,
      lng: (start.lng + end.lng) / 2,
    };
    alternatives.push(createRouteViaPoint(start, northPoint, end));

    // Ruta 2: Desviación hacia el sur
    const southPoint: RoutePoint = {
      lat: (start.lat + end.lat) / 2 - 0.01,
      lng: (start.lng + end.lng) / 2,
    };
    alternatives.push(createRouteViaPoint(start, southPoint, end));

    return alternatives;
  };

  const createRouteViaPoint = (
    start: RoutePoint,
    via: RoutePoint,
    end: RoutePoint
  ): Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended"> => {
    const points: RoutePoint[] = [start, via, end];
    const distance =
      calculateDistance(start, via) + calculateDistance(via, end);
    const duration = (distance / 45) * 3600; // Velocidad ligeramente menor por desvío

    const steps = [
      {
        instruction: `Toma el desvío por ${calculateDistance(start, via).toFixed(1)} km`,
        distance: calculateDistance(start, via),
        duration: (calculateDistance(start, via) / 45) * 3600,
        point: via,
      },
      {
        instruction: `Continúa hacia tu destino por ${calculateDistance(via, end).toFixed(1)} km`,
        distance: calculateDistance(via, end),
        duration: (calculateDistance(via, end) / 45) * 3600,
        point: end,
      },
    ];

    return { points, distance, duration, steps };
  };

  const calculateDistance = (point1: RoutePoint, point2: RoutePoint): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const calculateRouteRisk = (
    route: Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended">,
    alerts: Alert[]
  ): number => {
    let risk = 0;
    const ALERT_INFLUENCE_RADIUS = 0.5; // km

    route.points.forEach((point) => {
      alerts.forEach((alert) => {
        const distance = calculateDistance(point, {
          lat: alert.latitude,
          lng: alert.longitude,
        });

        if (distance < ALERT_INFLUENCE_RADIUS) {
          const severityWeight = {
            [AlertSeverity.CRITICA]: 10,
            [AlertSeverity.ALTA]: 5,
            [AlertSeverity.MEDIA]: 2,
            [AlertSeverity.BAJA]: 1,
          };
          risk += severityWeight[alert.severity] * (1 - distance / ALERT_INFLUENCE_RADIUS);
        }
      });
    });

    return risk;
  };

  const findAlertsOnRoute = (
    route: Omit<Route, "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended">,
    alerts: Alert[]
  ): Alert[] => {
    const ALERT_PROXIMITY_THRESHOLD = 0.5; // km
    const nearbyAlerts: Alert[] = [];

    route.points.forEach((point) => {
      alerts.forEach((alert) => {
        const distance = calculateDistance(point, {
          lat: alert.latitude,
          lng: alert.longitude,
        });

        if (
          distance < ALERT_PROXIMITY_THRESHOLD &&
          !nearbyAlerts.find((a) => a.id === alert.id)
        ) {
          nearbyAlerts.push(alert);
        }
      });
    });

    return nearbyAlerts;
  };

  return calculating ? (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg shadow-lg z-[1000]">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        Calculando rutas...
      </p>
    </div>
  ) : null;
}

// Componente principal
export default function WazeNavigation() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [searchDestination, setSearchDestination] = useState("");
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showQuickReports, setShowQuickReports] = useState(false);

  const {
    isNavigating,
    currentLocation,
    destination,
    routes,
    selectedRoute,
    currentStepIndex,
    routeHistory,
    alertsNearRoute,
    needsReroute,
    startNavigation,
    stopNavigation,
    setCurrentLocation,
    setDestination,
    selectRoute,
    addToRouteHistory,
    setCurrentStepIndex,
  } = useNavigationStore();

  const alerts = useAlertStore((state) => state.alerts);
  const { voiceGuidance } = useSettingsStore();
  const refreshAlerts = useAlertStore((state) => state.setAlerts);

  // Aplicar modo oscuro al mapa
  useMapDarkMode(mapRef);

  // Rastreo GPS en tiempo real
  useEffect(() => {
    if (!isNavigating) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setCurrentLocation(newLocation);
        addToRouteHistory(newLocation);

        // Verificar si llegamos al paso siguiente
        if (selectedRoute && selectedRoute.steps[currentStepIndex]) {
          const currentStep = selectedRoute.steps[currentStepIndex];
          const distanceToStep = calculateDistance(newLocation, currentStep.point);

          if (distanceToStep < 0.05) {
            // Menos de 50 metros
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < selectedRoute.steps.length) {
              setCurrentStepIndex(nextIndex);
              if (voiceGuidance) {
                speakInstruction(selectedRoute.steps[nextIndex].instruction);
              }
            } else {
              // Llegamos al destino
              stopNavigation();
              if (voiceGuidance) {
                speakInstruction("Has llegado a tu destino");
              }
            }
          }
        }
      },
      (error) => {
        console.error("Error getting GPS location:", error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [isNavigating, selectedRoute, currentStepIndex, voiceGuidance]);

  const calculateDistance = (point1: RoutePoint, point2: RoutePoint): number => {
    const R = 6371;
    const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
    const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1.lat * Math.PI) / 180) *
        Math.cos((point2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const speakInstruction = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "es-ES";
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleStartNavigation = () => {
    if (!destination) {
      alert("Por favor, selecciona un destino primero");
      return;
    }

    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: RoutePoint = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setCurrentLocation(location);
        startNavigation(destination);

        if (voiceGuidance) {
          speakInstruction("Iniciando navegación");
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("No se pudo obtener tu ubicación");
      }
    );
  };

  const handleSelectDestination = (lat: number, lng: number) => {
    setDestination({ lat, lng });
    setShowRouteSelector(false);
  };

  const handleRouteSelection = (route: Route) => {
    selectRoute(route);
    setShowRouteSelector(false);
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const defaultCenter: [number, number] = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : [4.6097, -74.0817]; // Bogotá por defecto

  return (
    <div className="relative h-screen w-full">
      {/* Mapa */}
      <div ref={mapRef} className="h-full w-full">
        <MapContainer
          center={defaultCenter}
          zoom={13}
          className="h-full w-full"
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcador de ubicación actual */}
          {currentLocation && (
            <Marker position={[currentLocation.lat, currentLocation.lng]} icon={userIcon}>
              <Popup>Tu ubicación actual</Popup>
            </Marker>
          )}

          {/* Marcador de destino */}
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={destinationIcon}
            >
              <Popup>Destino</Popup>
            </Marker>
          )}

          {/* Historial de ruta (línea azul) */}
          {routeHistory.length > 1 && (
            <Polyline
              positions={routeHistory.map((p) => [p.lat, p.lng])}
              color="#3b82f6"
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Ruta seleccionada */}
          {selectedRoute && (
            <Polyline
              positions={selectedRoute.points.map((p) => [p.lat, p.lng])}
              color={selectedRoute.isRecommended ? "#10b981" : "#f59e0b"}
              weight={5}
              opacity={0.8}
            />
          )}

          {/* Rutas alternativas */}
          {routes
            .filter((r) => r.id !== selectedRoute?.id)
            .map((route) => (
              <Polyline
                key={route.id}
                positions={route.points.map((p) => [p.lat, p.lng])}
                color="#9ca3af"
                weight={3}
                opacity={0.5}
              />
            ))}

          {/* Todas las alertas en el mapa */}
          {alerts.map((alert) => {
            const getAlertIcon = (type: AlertType, severity: AlertSeverity) => {
              const colorMap = {
                [AlertSeverity.CRITICA]: "#ef4444",
                [AlertSeverity.ALTA]: "#f97316",
                [AlertSeverity.MEDIA]: "#eab308",
                [AlertSeverity.BAJA]: "#84cc16",
              };

              const iconMap = {
                [AlertType.ACCIDENTE]: "🚗",
                [AlertType.DERRUMBE]: "🪨",
                [AlertType.INUNDACION]: "🌊",
                [AlertType.CIERRE_VIAL]: "🚧",
                [AlertType.MANTENIMIENTO]: "🔧",
              };

              return L.divIcon({
                className: "custom-alert-marker",
                html: `<div style="
                  background: ${colorMap[severity]};
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                ">${iconMap[type]}</div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              });
            };

            return (
              <Marker
                key={alert.id}
                position={[alert.latitude, alert.longitude]}
                icon={getAlertIcon(alert.type, alert.severity)}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">
                        {alert.type === AlertType.ACCIDENTE && "🚗"}
                        {alert.type === AlertType.DERRUMBE && "🪨"}
                        {alert.type === AlertType.INUNDACION && "🌊"}
                        {alert.type === AlertType.CIERRE_VIAL && "🚧"}
                        {alert.type === AlertType.MANTENIMIENTO && "🔧"}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">{alert.title}</h3>
                        <p className="text-xs text-gray-600">{alert.severity}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">{alert.description}</p>
                    <div className="text-xs text-gray-500">
                      <p>📍 {alert.location}</p>
                      <p>👤 {alert.username}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {destination && <RouteCalculator destination={destination} />}
        </MapContainer>
      </div>

      {/* Panel de controles superior */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
        <input
          type="text"
          placeholder="¿A dónde quieres ir?"
          value={searchDestination}
          onChange={(e) => setSearchDestination(e.target.value)}
          className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border-0 focus:ring-2 focus:ring-blue-500"
        />
        {!isNavigating ? (
          <button
            onClick={handleStartNavigation}
            disabled={!destination}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
          >
            <NavigationIcon size={20} />
            Iniciar
          </button>
        ) : (
          <button
            onClick={stopNavigation}
            className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 font-medium flex items-center gap-2"
          >
            <X size={20} />
            Detener
          </button>
        )}
      </div>

      {/* Panel de instrucciones de navegación */}
      {isNavigating && selectedRoute && selectedRoute.steps[currentStepIndex] && (
        <div className="absolute top-20 left-4 right-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4">
            <div className="flex items-start gap-3">
              <div className="bg-blue-600 p-3 rounded-full">
                <NavigationIcon size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedRoute.steps[currentStepIndex].instruction}
                </p>
                <div className="flex gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <RouteIcon size={16} />
                    {selectedRoute.steps[currentStepIndex].distance.toFixed(1)} km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {formatDuration(selectedRoute.steps[currentStepIndex].duration)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Selector de rutas */}
      {showRouteSelector && routes.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-h-64 overflow-y-auto">
            <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-white">
              Selecciona una ruta
            </h3>
            <div className="space-y-2">
              {routes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleRouteSelection(route)}
                  className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                    route.id === selectedRoute?.id
                      ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600 hover:border-blue-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {route.name}
                        {route.isRecommended && (
                          <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                            Recomendada
                          </span>
                        )}
                      </p>
                      <div className="flex gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <RouteIcon size={14} />
                          {route.distance.toFixed(1)} km
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {formatDuration(route.duration)}
                        </span>
                        {route.alertsOnRoute.length > 0 && (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle size={14} />
                            {route.alertsOnRoute.length}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-3">
                      <Gauge
                        size={32}
                        className={
                          route.riskScore < 5
                            ? "text-green-600"
                            : route.riskScore < 15
                              ? "text-amber-600"
                              : "text-red-600"
                        }
                      />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Alertas de recálculo */}
      {needsReroute && alertsNearRoute.length > 0 && (
        <div className="absolute top-36 left-4 right-4 z-[1000]">
          <div className="bg-amber-100 dark:bg-amber-900 border-l-4 border-amber-600 p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle size={24} className="text-amber-600" />
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-100">
                  Alerta en tu ruta
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200">
                  Hay {alertsNearRoute.length} alerta(s) en tu camino. Recalculando
                  ruta...
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón para mostrar selector de rutas */}
      {routes.length > 1 && isNavigating && (
        <button
          type="button"
          onClick={() => setShowRouteSelector(!showRouteSelector)}
          className="absolute bottom-4 right-4 z-[1000] bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        >
          <RouteIcon size={24} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}

      {/* Botón principal de reportes (Waze style) */}
      {currentLocation && (
        <button
          type="button"
          onClick={() => setShowQuickReports(!showQuickReports)}
          className="absolute bottom-24 right-4 z-[1000] bg-blue-600 hover:bg-blue-700 text-white p-5 rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110"
          title="Reportar alerta"
        >
          <Plus size={28} />
        </button>
      )}

      {/* Panel de reportes rápidos tipo Waze */}
      {showQuickReports && currentLocation && (
        <div className="absolute bottom-44 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 space-y-2 min-w-[200px]">
          <p className="text-xs font-bold text-gray-500 dark:text-gray-400 px-2 mb-2">
            REPORTAR
          </p>

          <button
            type="button"
            onClick={() => {
              setShowAlertModal(true);
              setShowQuickReports(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-left"
          >
            <div className="bg-red-600 p-2 rounded-full">
              <Car size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Accidente</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">En el camino</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAlertModal(true);
              setShowQuickReports(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors text-left"
          >
            <div className="bg-yellow-600 p-2 rounded-full">
              <Construction size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Peligro</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">En la vía</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAlertModal(true);
              setShowQuickReports(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
          >
            <div className="bg-blue-600 p-2 rounded-full">
              <Waves size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-white">Otros</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Reportar problema</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowQuickReports(false)}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Modal de creación de alerta */}
      {currentLocation && (
        <QuickAlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          location={currentLocation}
          onAlertCreated={async () => {
            // Recargar alertas después de crear una nueva
            try {
              const newAlerts = await alertApi.getAlerts();
              refreshAlerts(newAlerts);
            } catch (error) {
              console.error("Error refreshing alerts:", error);
            }
          }}
        />
      )}
    </div>
  );
}
