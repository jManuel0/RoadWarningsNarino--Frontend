import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { Icon, LatLng } from 'leaflet';
import { Navigation, MapPin, Crosshair, Check, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

interface InteractiveLocationPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  onClose: () => void;
  initialLat?: number;
  initialLng?: number;
}

// Componente para manejar clicks en el mapa
function MapClickHandler({ onLocationChange }: { onLocationChange: (latlng: LatLng) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationChange(e.latlng);
    },
  });
  return null;
}

// Componente para centrar el mapa en la ubicación del usuario
function RecenterButton({ position }: Readonly<{ position: [number, number] }>) {
  const map = useMap();

  const handleRecenter = () => {
    map.flyTo(position, 16, {
      duration: 1.5,
      easeLinearity: 0.5
    });
  };

  return (
    <button
      type="button"
      onClick={handleRecenter}
      className="absolute bottom-32 right-4 z-[1000] bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
      title="Centrar en mi ubicación"
    >
      <Navigation className="text-blue-600 dark:text-blue-400" size={24} />
    </button>
  );
}

// Componente para aplicar tema oscuro al mapa
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

export default function InteractiveLocationPicker({
  onLocationSelect,
  onClose,
  initialLat = 1.2136,
  initialLng = -77.2811,
}: Readonly<InteractiveLocationPickerProps>) {
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([initialLat, initialLng]);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState('Selecciona una ubicación en el mapa');
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );
  const mapRef = useRef(null);

  // Detectar cambios en el tema
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

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setSelectedPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();

      if (data.display_name) {
        setAddress(data.display_name);
      } else {
        setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setAddress(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (latlng: LatLng) => {
    setSelectedPosition([latlng.lat, latlng.lng]);
    fetchAddress(latlng.lat, latlng.lng);
  };

  const handleUseMyLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setSelectedPosition([latitude, longitude]);
          fetchAddress(latitude, longitude);
        }
      );
    }
  };

  const handleConfirm = () => {
    onLocationSelect(selectedPosition[0], selectedPosition[1], address);
    onClose();
  };

  // Icono personalizado del marcador
  const customIcon = new Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-900 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Selecciona la Ubicación
                </h2>
                <p className="text-blue-100 text-sm">
                  Toca en el mapa o usa tu ubicación actual
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Address Display */}
        <div className="bg-gray-50 dark:bg-gray-900 border-b dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <Crosshair className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={20} />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Ubicación seleccionada:
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {isLoading ? 'Obteniendo dirección...' : address}
              </p>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative min-h-[400px]">
          <MapContainer
            ref={mapRef}
            center={selectedPosition}
            zoom={16}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <DarkModeLayer isDark={isDarkMode} />
            <MapClickHandler onLocationChange={handleMapClick} />
            <Marker position={selectedPosition} icon={customIcon} />
            {userPosition && <RecenterButton position={userPosition} />}
          </MapContainer>

          {/* Use My Location Button */}
          <button
            type="button"
            onClick={handleUseMyLocation}
            className="absolute bottom-32 left-4 z-[1000] bg-white dark:bg-gray-800 px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
          >
            <Navigation className="text-green-600 dark:text-green-400" size={20} />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              Mi ubicación
            </span>
          </button>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 dark:bg-gray-900 border-t dark:border-gray-700 p-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all hover:shadow-lg flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Confirmar Ubicación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
