import { useState } from 'react';
import { Search, MapPin, Layers, X } from 'lucide-react';
import { Alert, AlertType, AlertPriority } from '@/types/Alert';

interface MapSearchBarProps {
  alerts: Alert[];
  onSearch: (filtered: Alert[]) => void;
  onReset: () => void;
}

export default function MapSearchBar({ alerts, onSearch, onReset }: Readonly<MapSearchBarProps>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<AlertType | 'ALL'>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<AlertPriority | 'ALL'>('ALL');
  const [radius, setRadius] = useState<number>(5000); // metros
  const [centerPoint, setCenterPoint] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const getPriorityName = (priority: AlertPriority): string => {
    if (priority === AlertPriority.CRITICA) return 'Crítica';
    if (priority === AlertPriority.ALTA) return 'Alta';
    if (priority === AlertPriority.MEDIA) return 'Media';
    return 'Baja';
  };

  const handleSearch = () => {
    let filtered = [...alerts];

    // Filtro por texto
    if (searchTerm) {
      filtered = filtered.filter(alert =>
        alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.affectedRoads.some(road => 
          road.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtro por tipo
    if (selectedType !== 'ALL') {
      filtered = filtered.filter(alert => alert.type === selectedType);
    }

    // Filtro por prioridad
    if (selectedPriority !== 'ALL') {
      filtered = filtered.filter(alert => alert.priority === selectedPriority);
    }

    // Filtro por radio (si hay un punto central)
    if (centerPoint) {
      filtered = filtered.filter(alert => {
        const distance = calculateDistance(
          centerPoint.lat,
          centerPoint.lng,
          alert.location.lat,
          alert.location.lng
        );
        return distance <= radius;
      });
    }

    onSearch(filtered);
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setSelectedPriority('ALL');
    setRadius(5000);
    setCenterPoint(null);
    onReset();
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenterPoint({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          handleSearch();
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
        }
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
      {/* Barra de búsqueda principal */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por ubicación, descripción o vía..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg transition-colors ${
            showFilters
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
          title="Filtros avanzados"
        >
          <Layers size={20} />
        </button>

        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          Buscar
        </button>

        {(searchTerm || selectedType !== 'ALL' || selectedPriority !== 'ALL' || centerPoint) && (
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            title="Limpiar filtros"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Filtros avanzados */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Filtro por tipo */}
          <div>
            <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Alerta
            </label>
            <select
              id="filter-type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as AlertType | 'ALL')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Todos</option>
              <option value={AlertType.DERRUMBE}>Derrumbe</option>
              <option value={AlertType.ACCIDENTE}>Accidente</option>
              <option value={AlertType.INUNDACION}>Inundación</option>
              <option value={AlertType.CIERRE_VIAL}>Cierre Vial</option>
              <option value={AlertType.MANTENIMIENTO}>Mantenimiento</option>
            </select>
          </div>

          {/* Filtro por prioridad */}
          <div>
            <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Prioridad
            </label>
            <select
              id="filter-priority"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value) as AlertPriority)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="ALL">Todas</option>
              <option value={AlertPriority.CRITICA}>Crítica</option>
              <option value={AlertPriority.ALTA}>Alta</option>
              <option value={AlertPriority.MEDIA}>Media</option>
              <option value={AlertPriority.BAJA}>Baja</option>
            </select>
          </div>

          {/* Radio de búsqueda */}
          <div>
            <label htmlFor="filter-radius" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Radio de Búsqueda
            </label>
            <select
              id="filter-radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={20000}>20 km</option>
            </select>
          </div>

          {/* Botón de ubicación actual */}
          <div>
            <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ubicación Centro
            </span>
            <button
              onClick={handleGetCurrentLocation}
              className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <MapPin size={16} />
              {centerPoint ? 'Ubicación Activa' : 'Mi Ubicación'}
            </button>
          </div>
        </div>
      )}

      {/* Indicadores de filtros activos */}
      {(searchTerm || selectedType !== 'ALL' || selectedPriority !== 'ALL' || centerPoint) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          {searchTerm && (
            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
              Texto: {searchTerm}
            </span>
          )}
          {selectedType !== 'ALL' && (
            <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm">
              Tipo: {selectedType}
            </span>
          )}
          {selectedPriority !== 'ALL' && (
            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm">
              Prioridad: {getPriorityName(selectedPriority)}
            </span>
          )}
          {centerPoint && (
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm">
              Radio: {radius / 1000} km desde ubicación
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Función para calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}