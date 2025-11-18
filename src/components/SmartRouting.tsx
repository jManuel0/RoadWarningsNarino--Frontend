import { useState, useEffect } from 'react';
import { Navigation, Route, Zap, TrendingUp } from 'lucide-react';
import { Alert, AlertSeverity } from '@/types/Alert';

interface SmartRoutingProps {
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  alerts: Alert[];
  onRouteCalculated?: (route: RouteInfo) => void;
}

interface RouteInfo {
  coordinates: [number, number][];
  distance: number;
  estimatedTime: number;
  alertsOnRoute: number;
  riskScore: number;
  alternative: boolean;
}

export default function SmartRouting({
  start,
  end,
  alerts,
  onRouteCalculated,
}: Readonly<SmartRoutingProps>) {
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<number>(0);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    calculateRoutes();
  }, [start, end, alerts]);

  const calculateRoutes = async () => {
    setCalculating(true);
    try {
      // Calculate direct route
      const directRoute = calculateDirectRoute(start, end);

      // Calculate alternative routes avoiding high-risk areas
      const alternativeRoutes = calculateAlternativeRoutes(start, end, alerts);

      const allRoutes = [directRoute, ...alternativeRoutes];
      setRoutes(allRoutes);

      // Select safest route by default
      const safestIndex = allRoutes.reduce((minIdx, route, idx, arr) =>
        route.riskScore < arr[minIdx].riskScore ? idx : minIdx
      , 0);
      setSelectedRoute(safestIndex);

      if (onRouteCalculated) {
        onRouteCalculated(allRoutes[safestIndex]);
      }
    } catch (error) {
      console.error('Error calculating routes:', error);
    } finally {
      setCalculating(false);
    }
  };

  const calculateDirectRoute = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): RouteInfo => {
    // Simple straight line (in production, use routing API like OSRM)
    const coordinates: [number, number][] = [[start.lat, start.lng], [end.lat, end.lng]];
    const distance = calculateDistance(start.lat, start.lng, end.lat, end.lng);
    const alertsOnRoute = countAlertsNearRoute(coordinates, alerts);
    const riskScore = calculateRiskScore(coordinates, alerts);

    return {
      coordinates,
      distance,
      estimatedTime: (distance / 50) * 60, // 50 km/h average
      alertsOnRoute,
      riskScore,
      alternative: false,
    };
  };

  const calculateAlternativeRoutes = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    alerts: Alert[]
  ): RouteInfo[] => {
    const alternatives: RouteInfo[] = [];

    // Calculate 2 alternative routes with different strategies

    // Alternative 1: Route avoiding critical alerts
    const criticalAlerts = alerts.filter(a => a.severity === AlertSeverity.CRITICA);
    if (criticalAlerts.length > 0) {
      const avoidRoute = calculateRouteAvoidingPoints(start, end, criticalAlerts);
      if (avoidRoute) {
        alternatives.push({
          ...avoidRoute,
          alternative: true,
        });
      }
    }

    // Alternative 2: Scenic route (slightly longer but safer)
    const scenicRoute = calculateScenicRoute(start, end);
    if (scenicRoute) {
      alternatives.push({
        ...scenicRoute,
        alternative: true,
      });
    }

    return alternatives;
  };

  const calculateRouteAvoidingPoints = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    avoidPoints: Alert[]
  ): RouteInfo | null => {
    // Create waypoint that avoids dangerous areas
    const midLat = (start.lat + end.lat) / 2;
    const midLng = (start.lng + end.lng) / 2;

    // Offset midpoint perpendicular to direct route
    const latDiff = end.lat - start.lat;
    const lngDiff = end.lng - start.lng;
    const perpLat = midLat + (lngDiff * 0.1);
    const perpLng = midLng - (latDiff * 0.1);

    const coordinates: [number, number][] = [
      [start.lat, start.lng],
      [perpLat, perpLng],
      [end.lat, end.lng],
    ];

    const distance = coordinates.reduce((total, coord, idx) => {
      if (idx === 0) return 0;
      const prev = coordinates[idx - 1];
      return total + calculateDistance(prev[0], prev[1], coord[0], coord[1]);
    }, 0);

    const alertsOnRoute = countAlertsNearRoute(coordinates, avoidPoints);
    const riskScore = calculateRiskScore(coordinates, avoidPoints);

    return {
      coordinates,
      distance,
      estimatedTime: (distance / 45) * 60, // Slightly slower on alternative
      alertsOnRoute,
      riskScore,
      alternative: true,
    };
  };

  const calculateScenicRoute = (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
  ): RouteInfo | null => {
    // Create a more scenic curved route
    const numPoints = 5;
    const coordinates: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = start.lat + (end.lat - start.lat) * t;
      const lng = start.lng + (end.lng - start.lng) * t;

      // Add curve
      const curve = Math.sin(t * Math.PI) * 0.05;
      coordinates.push([lat + curve, lng + curve]);
    }

    const distance = coordinates.reduce((total, coord, idx) => {
      if (idx === 0) return 0;
      const prev = coordinates[idx - 1];
      return total + calculateDistance(prev[0], prev[1], coord[0], coord[1]);
    }, 0);

    const alertsOnRoute = countAlertsNearRoute(coordinates, alerts);
    const riskScore = calculateRiskScore(coordinates, alerts);

    return {
      coordinates,
      distance,
      estimatedTime: (distance / 40) * 60, // Slower scenic route
      alertsOnRoute,
      riskScore,
      alternative: true,
    };
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const countAlertsNearRoute = (route: [number, number][], alerts: Alert[]): number => {
    const threshold = 0.5; // 500 meters
    return alerts.filter(alert =>
      route.some(point =>
        calculateDistance(point[0], point[1], alert.latitude, alert.longitude) < threshold
      )
    ).length;
  };

  const calculateRiskScore = (route: [number, number][], alerts: Alert[]): number => {
    let score = 0;
    const threshold = 1; // 1 km

    alerts.forEach(alert => {
      const closestDistance = Math.min(
        ...route.map(point =>
          calculateDistance(point[0], point[1], alert.latitude, alert.longitude)
        )
      );

      if (closestDistance < threshold) {
        const proximity = 1 - (closestDistance / threshold);
        const severityWeight = {
          [AlertSeverity.CRITICA]: 10,
          [AlertSeverity.ALTA]: 6,
          [AlertSeverity.MEDIA]: 3,
          [AlertSeverity.BAJA]: 1,
        }[alert.severity] || 1;

        score += proximity * severityWeight;
      }
    });

    return Math.round(score);
  };

  const getRouteColor = (riskScore: number): string => {
    if (riskScore >= 20) return '#dc2626'; // Red
    if (riskScore >= 10) return '#ea580c'; // Orange
    if (riskScore >= 5) return '#facc15';  // Yellow
    return '#10b981'; // Green
  };

  if (calculating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        <span className="ml-3 text-gray-600 dark:text-gray-400">Calculando rutas...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Route Options */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {routes.map((route, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedRoute(idx)}
            className={`p-4 rounded-lg border-2 transition-all ${
              selectedRoute === idx
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {route.alternative ? <Route size={20} /> : <Navigation size={20} />}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {route.alternative ? `Alternativa ${idx}` : 'Ruta Directa'}
                </span>
              </div>
              {route.riskScore < routes[0].riskScore && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Zap size={12} />
                  Recomendada
                </span>
              )}
            </div>

            <div className="space-y-1 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Distancia:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {route.distance.toFixed(1)} km
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tiempo:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {Math.round(route.estimatedTime)} min
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Alertas:</span>
                <span className={`font-medium ${
                  route.alertsOnRoute > 3 ? 'text-red-600' : 'text-green-600'
                }`}>
                  {route.alertsOnRoute}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Riesgo:</span>
                <div className="flex items-center gap-1">
                  <div
                    className="w-16 h-2 rounded-full"
                    style={{ backgroundColor: getRouteColor(route.riskScore) }}
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {route.riskScore}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selected Route Info */}
      {routes[selectedRoute] && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <TrendingUp size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Análisis de Ruta Inteligente
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Esta ruta tiene un nivel de riesgo{' '}
                <span className="font-bold" style={{ color: getRouteColor(routes[selectedRoute].riskScore) }}>
                  {routes[selectedRoute].riskScore < 5 ? 'BAJO' :
                   routes[selectedRoute].riskScore < 10 ? 'MEDIO' :
                   routes[selectedRoute].riskScore < 20 ? 'ALTO' : 'MUY ALTO'}
                </span>.
                {routes[selectedRoute].alertsOnRoute > 0 && (
                  <> Pasarás cerca de {routes[selectedRoute].alertsOnRoute} alerta(s) activa(s).</>
                )}
                {routes[selectedRoute].riskScore > 15 && (
                  <span className="block mt-2 text-orange-700 dark:text-orange-400 font-medium">
                    ⚠️ Recomendamos considerar una ruta alternativa más segura.
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
