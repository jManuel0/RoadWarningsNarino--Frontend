import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Navigation, MapPin, X, AlertTriangle, Clock, TrendingUp, Zap } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface GPSNavigationProps {
  destination: { lat: number; lng: number; name: string };
  onClose: () => void;
}

// Auto-centrado del mapa siguiendo al usuario
function AutoCenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, {
      animate: true,
      duration: 0.5
    });
  }, [center, zoom, map]);

  return null;
}

// Tema oscuro para el mapa
function DarkModeLayer({ isDark }: { isDark: boolean }) {
  const map = useMap();

  useEffect(() => {
    const mapContainer = map.getContainer();
    if (isDark) {
      mapContainer.style.filter = 'invert(1) hue-rotate(180deg) brightness(0.9) contrast(1.1)';
    } else {
      mapContainer.style.filter = '';
    }
  }, [isDark, map]);

  return null;
}

export default function GPSNavigation({ destination, onClose }: GPSNavigationProps) {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [speed, setSpeed] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [eta, setEta] = useState<string>('Calculando...');
  const [routePath, setRoutePath] = useState<[number, number][]>([]);
  const [isTracking, setIsTracking] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const watchIdRef = useRef<number | null>(null);

  // Detectar tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Calcular distancia entre dos puntos (Haversine)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Calcular bearing (dirección)
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180);
    const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
              Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon);
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Rastreo GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed: gpsSpeed, heading: gpsHeading } = position.coords;
        const newPosition: [number, number] = [latitude, longitude];

        setUserPosition(newPosition);
        setSpeed(gpsSpeed ? gpsSpeed * 3.6 : 0); // m/s a km/h

        // Calcular heading si no está disponible
        if (gpsHeading !== null) {
          setHeading(gpsHeading);
        } else if (userPosition) {
          const bearing = calculateBearing(
            userPosition[0],
            userPosition[1],
            latitude,
            longitude
          );
          setHeading(bearing);
        }

        // Calcular distancia al destino
        const dist = calculateDistance(
          latitude,
          longitude,
          destination.lat,
          destination.lng
        );
        setDistance(dist);

        // Calcular ETA
        if (gpsSpeed && gpsSpeed > 0) {
          const timeInHours = dist / (gpsSpeed * 3.6);
          const minutes = Math.round(timeInHours * 60);
          setEta(minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} min`);
        } else {
          setEta('En pausa');
        }

        // Agregar punto a la ruta
        setRoutePath((prev) => [...prev, newPosition]);
      },
      (error) => {
        console.error('GPS error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [destination, userPosition]);

  if (!userPosition) {
    return (
      <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
        <div className="text-center text-white">
          <Navigation size={64} className="mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold mb-2">Obteniendo GPS...</h2>
          <p className="text-blue-200">Activando navegación</p>
        </div>
      </div>
    );
  }

  const userIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  const destIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  });

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-gray-900">
      {/* Header con info de navegación */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 dark:from-blue-800 dark:via-blue-900 dark:to-black text-white p-4 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg animate-pulse">
              <Navigation size={24} />
            </div>
            <div>
              <h2 className="font-bold text-lg">Navegando a:</h2>
              <p className="text-sm text-blue-100">{destination.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-blue-200" />
              <span className="text-xs text-blue-200">Distancia</span>
            </div>
            <p className="text-2xl font-bold">{distance.toFixed(1)} km</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-blue-200" />
              <span className="text-xs text-blue-200">ETA</span>
            </div>
            <p className="text-2xl font-bold">{eta}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <Zap size={16} className="text-blue-200" />
              <span className="text-xs text-blue-200">Velocidad</span>
            </div>
            <p className="text-2xl font-bold">{speed.toFixed(0)} km/h</p>
          </div>
        </div>
      </div>

      {/* Mapa GPS */}
      <div className="flex-1 relative">
        <MapContainer
          center={userPosition}
          zoom={17}
          zoomControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <DarkModeLayer isDark={isDarkMode} />
          {isTracking && <AutoCenter center={userPosition} zoom={17} />}

          {/* Marcador del usuario */}
          <Marker position={userPosition} icon={userIcon} />

          {/* Marcador del destino */}
          <Marker position={[destination.lat, destination.lng]} icon={destIcon} />

          {/* Línea de ruta recorrida */}
          {routePath.length > 1 && (
            <Polyline
              positions={routePath}
              color="#3b82f6"
              weight={4}
              opacity={0.7}
            />
          )}

          {/* Línea directa al destino */}
          <Polyline
            positions={[userPosition, [destination.lat, destination.lng]]}
            color="#ef4444"
            weight={2}
            opacity={0.5}
            dashArray="10, 10"
          />
        </MapContainer>

        {/* Compass/Heading indicator */}
        <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-full shadow-2xl">
          <div className="relative w-16 h-16">
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ transform: `rotate(${heading}deg)` }}
            >
              <Navigation size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xs font-bold text-gray-600 dark:text-gray-300 mt-12">
                {Math.round(heading)}°
              </div>
            </div>
          </div>
        </div>

        {/* Tracking toggle button */}
        <button
          type="button"
          onClick={() => setIsTracking(!isTracking)}
          className={`absolute bottom-24 right-4 p-4 rounded-full shadow-2xl transition-all ${
            isTracking
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          title={isTracking ? 'Desactivar seguimiento' : 'Activar seguimiento'}
        >
          <MapPin size={24} />
        </button>

        {/* Warning if too far */}
        {distance > 50 && (
          <div className="absolute bottom-32 left-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-xl flex items-center gap-3">
            <AlertTriangle size={24} />
            <div className="flex-1">
              <p className="font-bold">Destino lejano</p>
              <p className="text-sm">Estás a más de 50 km del destino</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer con instrucciones */}
      <div className="bg-gray-800 dark:bg-black text-white p-4 text-center">
        <p className="text-sm">
          🧭 Siguiendo tu ubicación en tiempo real • {distance > 0.1 ? 'Conduciendo' : 'Has llegado!'}
        </p>
      </div>
    </div>
  );
}
