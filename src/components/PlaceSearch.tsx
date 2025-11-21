// src/components/PlaceSearch.tsx
import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Clock, Star, X } from 'lucide-react';

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type?: string;
  rating?: number;
}

interface PlaceSearchProps {
  onPlaceSelect: (place: Place) => void;
  placeholder?: string;
}

export default function PlaceSearch({ onPlaceSelect, placeholder = "Buscar lugares..." }: PlaceSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const [recentSearches, setRecentSearches] = useState<Place[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar búsquedas recientes del localStorage
    const saved = localStorage.getItem('recent-searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Cerrar al hacer click fuera
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const searchPlaces = async () => {
      setLoading(true);
      try {
        // Aquí integrarías con Google Places API o tu propio backend
        // Por ahora, simulamos resultados
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockResults: Place[] = [
          {
            id: '1',
            name: 'Hospital San Pedro',
            address: 'Calle 18 #25-04, Pasto',
            lat: 1.2136,
            lng: -77.2811,
            type: 'hospital',
            rating: 4.2
          },
          {
            id: '2',
            name: 'Gasolinera Terpel Centro',
            address: 'Carrera 27 #18-50, Pasto',
            lat: 1.2145,
            lng: -77.2805,
            type: 'gas_station',
            rating: 4.0
          },
          {
            id: '3',
            name: 'Centro Comercial Unicentro',
            address: 'Calle 18 #27-50, Pasto',
            lat: 1.2150,
            lng: -77.2800,
            type: 'shopping_mall',
            rating: 4.5
          }
        ].filter(place => 
          place.name.toLowerCase().includes(query.toLowerCase()) ||
          place.address.toLowerCase().includes(query.toLowerCase())
        );

        setResults(mockResults);
      } catch (error) {
        console.error('Error searching places:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchPlaces, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  const handleSelectPlace = (place: Place) => {
    // Guardar en búsquedas recientes
    const updated = [place, ...recentSearches.filter(p => p.id !== place.id)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recent-searches', JSON.stringify(updated));

    onPlaceSelect(place);
    setQuery('');
    setIsOpen(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent-searches');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-2xl">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto z-50">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : query.length >= 3 && results.length > 0 ? (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                Resultados
              </div>
              {results.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 text-left transition-colors"
                >
                  <MapPin className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {place.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {place.address}
                    </div>
                    {place.rating && (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={14} className="text-yellow-500 fill-yellow-500" />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {place.rating}
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 3 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No se encontraron resultados
            </div>
          ) : recentSearches.length > 0 ? (
            <div>
              <div className="px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                  Búsquedas recientes
                </span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpiar
                </button>
              </div>
              {recentSearches.map((place) => (
                <button
                  key={place.id}
                  onClick={() => handleSelectPlace(place)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-start gap-3 text-left transition-colors"
                >
                  <Clock className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white truncate">
                      {place.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {place.address}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              Escribe al menos 3 caracteres para buscar
            </div>
          )}
        </div>
      )}
    </div>
  );
}
