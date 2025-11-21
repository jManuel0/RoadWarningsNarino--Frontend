import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
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
import {
  useNavigationStore,
  Route,
  RoutePoint,
} from "@/stores/navigationStore";
import { useAlertStore } from "@/stores/alertStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { Alert, AlertSeverity, AlertType } from "@/types/Alert";
import { useMapDarkMode } from "@/hooks/useMapDarkMode";
import { useAuthStore } from "@/stores/authStore";
import { alertApi } from "@/api/alertApi";
import QuickAlertModal from "./QuickAlertModal";
import { getOsrmRoutes } from "@/services/routing";
import { websocketService } from "@/services/websocketService";

type PlaceResult = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
};

type NominatimSearchResult = {
  place_id?: number | string;
  display_name?: string;
  lat?: string;
  lon?: string;
};

function MapClickHandler({
  onSelectDestination,
}: {
  onSelectDestination: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onSelectDestination(e.latlng.lat, e.latlng.lng);
    },
  });

  return null;
}

function DestinationCenter({
  destination,
}: {
  destination: RoutePoint | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (!destination) return;
    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 15);
    map.setView([destination.lat, destination.lng], targetZoom);
  }, [destination, map]);

  return null;
}

function NavigationFollower() {
  const map = useMap();
  const { isNavigating, currentLocation } = useNavigationStore();

  useEffect(() => {
    if (!isNavigating || !currentLocation) return;

    const currentZoom = map.getZoom();
    const targetZoom = Math.max(currentZoom, 16);
    map.setView([currentLocation.lat, currentLocation.lng], targetZoom);
  }, [isNavigating, currentLocation, map]);

  return null;
}

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
  const {
    currentLocation,
    setRoutes,
    selectRoute,
    setAlertsNearRoute,
    selectedRoute,
  } = useNavigationStore();
  const alerts = useAlertStore((state) => state.getActiveAlerts());
  const { avoidCriticalAlerts, autoReroute, routePreference } =
    useSettingsStore();
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (!currentLocation || !destination) return;

    calculateRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLocation, destination, alerts, avoidCriticalAlerts]);

  const calculateRoutes = async () => {
    if (!currentLocation || !destination) return;

    setCalculating(true);

    try {
      // Obtener rutas reales por calles usando OSRM
      const baseRoutes = await getOsrmRoutes(
        currentLocation,
        destination,
        "driving"
      );

      // Si el usuario quiere evitar alertas críticas, intentamos descartar
      // rutas que pasen demasiado cerca de ellas.
      let candidateRoutes = baseRoutes;
      if (avoidCriticalAlerts) {
        const criticalAlerts = alerts.filter(
          (a) => a.severity === AlertSeverity.CRITICA
        );
        const CRITICAL_AVOID_RADIUS_KM = 0.3; // 300 m

        if (criticalAlerts.length > 0) {
          const safeRoutes = baseRoutes.filter((route) =>
            route.points.every((point) =>
              criticalAlerts.every((alert) => {
                const distanceToAlert = calculateDistance(point, {
                  lat: alert.latitude,
                  lng: alert.longitude,
                });
                return distanceToAlert >= CRITICAL_AVOID_RADIUS_KM;
              })
            )
          );

          if (safeRoutes.length > 0) {
            candidateRoutes = safeRoutes;
          }
        }
      }

      // Calcular riesgo para cada ruta candidata y asociar alertas
      const routesWithRisk = candidateRoutes.map((route, index) => {
        const riskScore = calculateRouteRisk(route, alerts);
        const alertsOnRoute = findAlertsOnRoute(route, alerts);

        return {
          ...route,
          id: `route-${index}`,
          name: index === 0 ? "Ruta recomendada" : `Alternativa ${index}`,
          riskScore,
          alertsOnRoute,
          isRecommended: false,
        };
      });

      // Marcar la ruta recomendada según preferencia del usuario
      const sortedRoutes = [...routesWithRisk].sort((a, b) => {
        if (routePreference === "fastest") {
          return a.duration - b.duration;
        }
        if (routePreference === "shortest") {
          return a.distance - b.distance;
        }
        // "safest" (por defecto): menor riesgo
        return a.riskScore - b.riskScore;
      });
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

  const calculateDistance = (
    point1: RoutePoint,
    point2: RoutePoint
  ): number => {
    const R = 6371; // km
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
    route: Omit<
      Route,
      "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended"
    >,
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
          risk +=
            severityWeight[alert.severity] *
            (1 - distance / ALERT_INFLUENCE_RADIUS);
        }
      });
    });

    return risk;
  };

  const findAlertsOnRoute = (
    route: Omit<
      Route,
      "id" | "name" | "riskScore" | "alertsOnRoute" | "isRecommended"
    >,
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
          !nearbyAlerts.some((a) => a.id === alert.id)
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
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [showPlaceResults, setShowPlaceResults] = useState(false);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);
  const [showRouteSelector, setShowRouteSelector] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [showQuickReports, setShowQuickReports] = useState(false);
  const [, setLastSearchedQuery] = useState<string | null>(null);

  // Para evitar repetir avisos de voz por cada paso
  const lastSpokenStep300Ref = useRef<number | null>(null);
  const lastSpokenStep50Ref = useRef<number | null>(null);
  const lastLocationRef = useRef<{ point: RoutePoint; time: number } | null>(
    null
  );
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number | null>(null);
  const [nearbyAlertBanner, setNearbyAlertBanner] = useState<{
    alert: Alert;
    distanceKm: number;
  } | null>(null);

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
    savedDestinations,
    addRecentDestination,
    toggleFavoriteDestination,
  } = useNavigationStore();

  const alerts = useAlertStore((state) => state.alerts);
  const { voiceGuidance, routePreference, setRoutePreference } =
    useSettingsStore();
  const refreshAlerts = useAlertStore((state) => state.setAlerts);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  const navigate = useNavigate();

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

        // Calcular velocidad aproximada en km/h a partir de la ubicación previa
        const now = Date.now();
        if (lastLocationRef.current) {
          const dtSeconds = (now - lastLocationRef.current.time) / 1000;
          if (dtSeconds > 0) {
            const distKm = calculateDistance(
              lastLocationRef.current.point,
              newLocation
            );
            const speed = (distKm / dtSeconds) * 3600; // km/h
            setCurrentSpeedKmh(speed);
          }
        }
        lastLocationRef.current = { point: newLocation, time: now };

        setCurrentLocation(newLocation);
        addToRouteHistory(newLocation);

        // Verificar si llegamos al paso siguiente
        if (selectedRoute?.steps[currentStepIndex]) {
          const currentStep = selectedRoute.steps[currentStepIndex];
          const distanceToStep = calculateDistance(
            newLocation,
            currentStep.point
          );

          // Aviso anticipado a ~300 metros
          if (
            voiceGuidance &&
            distanceToStep <= 0.3 &&
            distanceToStep > 0.05 &&
            lastSpokenStep300Ref.current !== currentStepIndex
          ) {
            speakInstruction(
              `En 300 metros, ${currentStep.instruction || "sigue las indicaciones"}`
            );
            lastSpokenStep300Ref.current = currentStepIndex;
          }

          // Aviso anticipado a ~50 metros
          if (
            voiceGuidance &&
            distanceToStep <= 0.05 &&
            distanceToStep > 0.02 &&
            lastSpokenStep50Ref.current !== currentStepIndex
          ) {
            speakInstruction(
              `En 50 metros, ${currentStep.instruction || "sigue las indicaciones"}`
            );
            lastSpokenStep50Ref.current = currentStepIndex;
          }

          // Consideramos que llegamos al punto del paso a menos de 20 metros
          if (distanceToStep <= 0.02) {
            const nextIndex = currentStepIndex + 1;
            if (nextIndex < selectedRoute.steps.length) {
              setCurrentStepIndex(nextIndex);
              // Reiniciar avisos para el siguiente paso
              lastSpokenStep300Ref.current = null;
              lastSpokenStep50Ref.current = null;

              if (voiceGuidance) {
                speakInstruction(selectedRoute.steps[nextIndex].instruction);
              }
            } else {
              // Llegamos al destino
              stopNavigation();
              lastSpokenStep300Ref.current = null;
              lastSpokenStep50Ref.current = null;
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
  }, [
    isNavigating,
    selectedRoute,
    currentStepIndex,
    voiceGuidance,
    setCurrentLocation,
    addToRouteHistory,
    setCurrentStepIndex,
    stopNavigation,
  ]);

  const calculateDistance = (
    point1: RoutePoint,
    point2: RoutePoint
  ): number => {
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

  // Banner de nuevas alertas cercanas a la ruta actual
  useEffect(() => {
    const unsubscribe = websocketService.onAlertCreated((alert: Alert) => {
      if (!isNavigating || !selectedRoute) return;

      const alertPoint: RoutePoint = {
        lat: alert.latitude,
        lng: alert.longitude,
      };

      let minDistance = Infinity;
      selectedRoute.points.forEach((p) => {
        const d = calculateDistance(p, alertPoint);
        if (d < minDistance) minDistance = d;
      });

      const THRESHOLD_KM = 0.3; // 300 m
      if (minDistance <= THRESHOLD_KM) {
        setNearbyAlertBanner({
          alert,
          distanceKm: minDistance,
        });
      }
    });

    return unsubscribe;
  }, [isNavigating, selectedRoute]);

  const ensureCanReport = (): boolean => {
    if (isAuthenticated) return true;

    const goRegister = window.confirm(
      "Para reportar alertas necesitas una cuenta. ¿Quieres registrarte ahora?"
    );

    if (goRegister) {
      navigate("/register");
    } else {
      navigate("/login");
    }
    return false;
  };

  const handleSearchDestination = async () => {
    const query = searchDestination.trim();
    if (!query) {
      alert("Escribe una dirección o lugar para buscar.");
      return;
    }

    if (isSearchingDestination) return;

    setIsSearchingDestination(true);
    setShowPlaceResults(false);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );

      if (!response.ok) {
        throw new Error("Error al buscar destino");
      }

      const results = (await response.json()) as NominatimSearchResult[];

      if (!results.length) {
        alert("No se encontró el lugar. Intenta con otra dirección.");
        setPlaceResults([]);
        return;
      }

      const mapped: PlaceResult[] = results.map((r, index: number) => ({
        id: r.place_id ? String(r.place_id) : String(index),
        name: r.display_name ? String(r.display_name).split(",")[0] : query,
        address: r.display_name ?? "",
        lat: parseFloat(r.lat ?? "0"),
        lng: parseFloat(r.lon ?? "0"),
      }));

      setPlaceResults(mapped);
      setShowPlaceResults(true);
      setLastSearchedQuery(query);

      if (mapped[0]) {
        const destPoint: RoutePoint = {
          lat: mapped[0].lat,
          lng: mapped[0].lng,
        };
        setDestination(destPoint);
        setSelectedPlaceId(mapped[0].id);
        addRecentDestination(mapped[0].name, destPoint);
      }
    } catch (error) {
      console.error("Error buscando destino:", error);
      alert("No se pudo buscar el destino. Intenta de nuevo.");
      setPlaceResults([]);
    } finally {
      setIsSearchingDestination(false);
    }
  };

  const handleStartNavigation = () => {
    if (!destination) {
      alert(
        "Por favor, selecciona un destino primero (haz clic en el mapa o busca una dirección)."
      );
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
    const destPoint: RoutePoint = { lat, lng };
    setDestination(destPoint);
    setShowRouteSelector(false);
    setSearchDestination(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    addRecentDestination(`${lat.toFixed(5)}, ${lng.toFixed(5)}`, destPoint);
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
    : [1.2136, -77.2811]; // Pasto, Nariño por defecto

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
          <NavigationFollower />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Marcador de ubicación actual */}
          {currentLocation && (
            <Marker
              position={[currentLocation.lat, currentLocation.lng]}
              icon={userIcon}
            >
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
            const colorMap: Record<AlertSeverity, string> = {
              [AlertSeverity.CRITICA]: "#ef4444",
              [AlertSeverity.ALTA]: "#f97316",
              [AlertSeverity.MEDIA]: "#eab308",
              [AlertSeverity.BAJA]: "#84cc16",
            };

            const iconMap: Record<AlertType, string> = {
              [AlertType.ACCIDENTE]: "🚗",
              [AlertType.DERRUMBE]: "🪨",
              [AlertType.INUNDACION]: "🌊",
              [AlertType.CIERRE_VIAL]: "🚧",
              [AlertType.MANTENIMIENTO]: "🔧",
              [AlertType.Protests]: "",
              [AlertType.Protestas]: "",
            };

            const icon = L.divIcon({
              className: "custom-alert-marker",
              html: `<div style="
                background: ${colorMap[alert.severity]};
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 16px;
              ">${iconMap[alert.type]}</div>`,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            return (
              <Marker
                key={alert.id}
                position={[alert.latitude, alert.longitude]}
                icon={icon}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-xl">
                        {iconMap[alert.type] ?? "⚠️"}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900">
                          {alert.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {alert.severity}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {alert.description}
                    </p>
                    <div className="text-xs text-gray-500">
                      <p>📍 {alert.location}</p>
                      <p>👤 {alert.username}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          <MapClickHandler onSelectDestination={handleSelectDestination} />
          <DestinationCenter destination={destination} />

          {destination && <RouteCalculator destination={destination} />}
        </MapContainer>
      </div>

      {/* Panel de controles superior */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-col gap-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="¿A dónde quieres ir? (escribe y presiona Enter)"
            value={searchDestination}
            onChange={(e) => setSearchDestination(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearchDestination();
              }
            }}
            className="flex-1 px-4 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border-0 focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={routePreference}
            onChange={(e) =>
              setRoutePreference(
                e.target.value as "safest" | "fastest" | "shortest"
              )
            }
            className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 text-sm"
          >
            <option value="safest">Más segura</option>
            <option value="fastest">Más rápida</option>
            <option value="shortest">Más corta</option>
          </select>
          {isNavigating ? (
            <button
              onClick={stopNavigation}
              className="px-6 py-3 bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 font-medium flex items-center gap-2"
            >
              <X size={20} />
              Detener
            </button>
          ) : (
            <button
              onClick={handleStartNavigation}
              disabled={!destination || isSearchingDestination}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
            >
              <NavigationIcon size={20} />
              {isSearchingDestination ? "Buscando..." : "Iniciar"}
            </button>
          )}
        </div>

        {savedDestinations.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {savedDestinations.slice(0, 5).map((dest) => (
              <button
                key={dest.id}
                type="button"
                onClick={() => {
                  setDestination(dest.location);
                  setSearchDestination(dest.name);
                }}
                className="px-3 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 shadow text-xs flex items-center gap-2"
              >
                <span>{dest.name}</span>
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavoriteDestination(dest.id);
                  }}
                  className="cursor-pointer"
                  title="Marcar como favorito"
                >
                  {dest.favorite ? "★" : "☆"}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lista de sugerencias de lugares */}
      <div className="absolute top-16 left-4 right-4 z-[1100]">
        {showPlaceResults && placeResults.length > 0 && (
          <ul className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-700">
            {placeResults.map((place) => (
              <li
                key={place.id}
                onClick={() => {
                  const destPoint: RoutePoint = {
                    lat: place.lat,
                    lng: place.lng,
                  };
                  setDestination(destPoint);
                  setSearchDestination(place.name);
                  setSelectedPlaceId(place.id);
                  setShowPlaceResults(false);
                  addRecentDestination(place.name, destPoint);
                }}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selectedPlaceId === place.id
                    ? "bg-gray-100 dark:bg-gray-700"
                    : ""
                }`}
              >
                <div className="font-medium text-gray-900 dark:text-gray-100">
                  {place.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {place.address}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Panel de instrucciones de navegación */}
      {isNavigating && selectedRoute?.steps[currentStepIndex] && (
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
                    {selectedRoute.steps[currentStepIndex].distance.toFixed(
                      1
                    )}{" "}
                    km
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={16} />
                    {formatDuration(
                      selectedRoute.steps[currentStepIndex].duration
                    )}
                  </span>
                  {currentSpeedKmh !== null && (
                    <span className="flex items-center gap-1">
                      <Gauge size={16} />
                      {Math.round(currentSpeedKmh)} km/h
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner de nueva alerta cercana a la ruta */}
      {isNavigating && nearbyAlertBanner && (
        <div className="absolute top-32 left-4 right-4 z-[1000]">
          <div className="bg-amber-100 dark:bg-amber-900 border-l-4 border-amber-600 p-3 rounded-lg shadow-lg flex justify-between items-center">
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-100">
                Nueva alerta en tu ruta
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-200">
                A unos {Math.round(nearbyAlertBanner.distanceKm * 1000)} m:{" "}
                {nearbyAlertBanner.alert.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNearbyAlertBanner(null)}
              className="text-sm text-amber-900 dark:text-amber-100 font-medium"
            >
              Cerrar
            </button>
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
                  Hay {alertsNearRoute.length} alerta(s) en tu camino.
                  Recalculando ruta...
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
          onClick={() => {
            if (!ensureCanReport()) return;
            setShowQuickReports(!showQuickReports);
          }}
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
              <p className="font-semibold text-gray-900 dark:text-white">
                Accidente
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                En el camino
              </p>
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
              <p className="font-semibold text-gray-900 dark:text-white">
                Peligro
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                En la vía
              </p>
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
              <p className="font-semibold text-gray-900 dark:text-white">
                Otros
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reportar problema
              </p>
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
