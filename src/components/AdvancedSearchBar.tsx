import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  Clock,
  Star,
  Navigation,
  X,
  Loader2,
  TrendingUp,
} from "lucide-react";
import {
  geocodingService,
  PlaceResult,
  PLACE_CATEGORIES,
  PlaceCategory,
} from "@/services/geocodingService";

interface AdvancedSearchBarProps {
  onPlaceSelected: (place: PlaceResult) => void;
  userLocation?: { lat: number; lng: number };
  className?: string;
  placeholder?: string;
}

export default function AdvancedSearchBar({
  onPlaceSelected,
  userLocation,
  className = "",
  placeholder = "¿A dónde quieres ir?",
}: Readonly<AdvancedSearchBarProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [recentSearches, setRecentSearches] = useState<PlaceResult[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Cargar búsquedas recientes del localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error("Error cargando búsquedas recientes:", error);
      }
    }
  }, []);

  // Guardar búsqueda reciente
  const saveRecentSearch = useCallback((place: PlaceResult) => {
    setRecentSearches((prev) => {
      // Evitar duplicados
      const filtered = prev.filter((p) => p.id !== place.id);
      const updated = [place, ...filtered].slice(0, 5); // Máximo 5 recientes

      // Guardar en localStorage
      localStorage.setItem("recentSearches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Buscar lugares con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowCategories(true);
      return;
    }

    setIsSearching(true);
    setShowCategories(false);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const places = await geocodingService.searchPlaces(
          searchQuery,
          userLocation,
          10
        );
        setResults(places);
        setShowResults(true);
      } catch (error) {
        console.error("Error buscando lugares:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce de 300ms

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, userLocation]);

  // Buscar por categoría
  const handleCategorySearch = async (category: PlaceCategory) => {
    if (!userLocation) {
      alert("Por favor, activa tu ubicación para buscar lugares cercanos");
      return;
    }

    setIsSearching(true);
    setShowCategories(false);
    setSearchQuery(category.name);

    try {
      const places = await geocodingService.searchNearbyPlaces(
        userLocation,
        category,
        10
      );
      setResults(places);
      setShowResults(true);
    } catch (error) {
      console.error("Error buscando por categoría:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Seleccionar lugar
  const handleSelectPlace = (place: PlaceResult) => {
    saveRecentSearch(place);
    setSearchQuery(place.name);
    setShowResults(false);
    setShowCategories(false);
    onPlaceSelected(place);
  };

  // Limpiar búsqueda
  const handleClear = () => {
    setSearchQuery("");
    setResults([]);
    setShowCategories(true);
    searchInputRef.current?.focus();
  };

  // Cerrar resultados al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        setShowCategories(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Formatear distancia
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };

  // Obtener icono según tipo de lugar
  const getPlaceIcon = (place: PlaceResult): string => {
    const category = PLACE_CATEGORIES.find(
      (c) => c.osmValue === place.category
    );
    return category?.icon || "📍";
  };

  return (
    <div className={`relative ${className}`} ref={resultsRef}>
      {/* Barra de búsqueda */}
      <div className="relative">
        <Search
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />

        <input
          ref={searchInputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.trim().length < 2) {
              setShowCategories(true);
            } else {
              setShowResults(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
        />

        {/* Indicador de carga */}
        {isSearching && (
          <Loader2
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-600 animate-spin"
            size={20}
          />
        )}

        {/* Botón para limpiar */}
        {searchQuery && !isSearching && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Categorías rápidas (similar a Google Maps) */}
      {showCategories && searchQuery.trim().length < 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto z-50">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <TrendingUp size={16} />
              Buscar lugares cercanos
            </h3>

            {/* Grid de categorías */}
            <div className="grid grid-cols-2 gap-2">
              {PLACE_CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategorySearch(category)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                  style={{ borderLeft: `4px solid ${category.color}` }}
                >
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {category.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Cerca de ti
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {/* Búsquedas recientes */}
            {recentSearches.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Búsquedas recientes
                </h3>
                <div className="space-y-1">
                  {recentSearches.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => handleSelectPlace(place)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <MapPin
                        size={16}
                        className="text-gray-400 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {place.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {place.address}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {showResults && results.length > 0 && searchQuery.trim().length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[500px] overflow-y-auto z-50">
          <div className="p-2">
            {results.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => handleSelectPlace(place)}
                className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left group"
              >
                {/* Icono del lugar */}
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl">
                  {getPlaceIcon(place)}
                </div>

                {/* Información del lugar */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                      {place.name}
                    </p>
                    {place.rating && (
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs">{place.rating}</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                    {place.address}
                  </p>

                  {/* Distancia */}
                  {place.distance !== undefined && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <Navigation size={12} />
                      <span>{formatDistance(place.distance)}</span>
                    </div>
                  )}
                </div>

                {/* Indicador de categoría */}
                {place.category && (
                  <div className="flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {place.category}
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sin resultados */}
      {showResults &&
        results.length === 0 &&
        searchQuery.trim().length >= 2 &&
        !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 p-6 text-center z-50">
            <MapPin size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">
              No se encontraron lugares para "{searchQuery}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
              Intenta con otra búsqueda o selecciona una categoría
            </p>
          </div>
        )}
    </div>
  );
}
