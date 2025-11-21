// src/pages/EnhancedMapPage.tsx
import { useState } from 'react';
import { MapPin, Navigation as NavigationIcon } from 'lucide-react';
import PlaceSearch from '@/components/PlaceSearch';
import RouteComparison from '@/components/RouteComparison';
import SavedPlaces from '@/components/SavedPlaces';
import MapLayers from '@/components/MapLayers';
import PlaceDetails from '@/components/PlaceDetails';

interface Place {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  totalReviews?: number;
  phone?: string;
  website?: string;
  hours?: string;
  photos?: string[];
  category?: string;
}

export default function EnhancedMapPage() {
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState('1');

  // Mock routes data
  const routes = selectedPlace ? [
    {
      id: '1',
      name: 'Ruta por Autopista',
      distance: 15.5,
      duration: 25,
      traffic: 'low' as const,
      alerts: 0,
      isFastest: true
    },
    {
      id: '2',
      name: 'Ruta Centro',
      distance: 12.3,
      duration: 35,
      traffic: 'high' as const,
      alerts: 2,
      isShortest: true
    },
    {
      id: '3',
      name: 'Ruta Panorámica',
      distance: 18.7,
      duration: 30,
      traffic: 'medium' as const,
      alerts: 1,
      isSafest: true
    }
  ] : [];

  const handlePlaceSelect = (place: Place) => {
    setSelectedPlace(place);
    setShowDetails(true);
  };

  const handleNavigate = () => {
    setShowDetails(false);
    // Aquí iniciarías la navegación real
    console.log('Navegando a:', selectedPlace);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-lg z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg">
                <MapPin className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Navegación Avanzada
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Encuentra lugares y navega con múltiples opciones
                </p>
              </div>
            </div>
            
            <div className="flex-1 max-w-2xl mx-auto">
              <PlaceSearch
                onPlaceSelect={handlePlaceSelect}
                placeholder="Buscar hospitales, gasolineras, restaurantes..."
              />
            </div>

            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="lg:hidden px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              {showSidebar ? 'Ocultar' : 'Mostrar'} Panel
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`${
            showSidebar ? 'w-96' : 'w-0'
          } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto transition-all duration-300`}
        >
          <div className="p-4 space-y-6">
            {/* Saved Places */}
            <SavedPlaces onPlaceSelect={handlePlaceSelect} />

            {/* Route Comparison */}
            {routes.length > 0 && (
              <div>
                <RouteComparison
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onSelectRoute={setSelectedRoute}
                />
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">
                Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow">
                  <div className="font-medium text-gray-900 dark:text-white">
                    🏥 Hospitales cercanos
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Encuentra atención médica
                  </div>
                </button>
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow">
                  <div className="font-medium text-gray-900 dark:text-white">
                    ⛽ Gasolineras
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Encuentra combustible
                  </div>
                </button>
                <button className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg text-left hover:shadow-md transition-shadow">
                  <div className="font-medium text-gray-900 dark:text-white">
                    🍽️ Restaurantes
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Lugares para comer
                  </div>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative bg-gray-100 dark:bg-gray-900">
          {/* Map Placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Mapa Interactivo
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                Aquí se mostraría tu componente de mapa (Leaflet, Google Maps, etc.)
                con todas las funcionalidades integradas.
              </p>
              {selectedPlace && (
                <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg inline-block">
                  <div className="flex items-center gap-3">
                    <NavigationIcon className="text-blue-600" size={24} />
                    <div className="text-left">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {selectedPlace.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {selectedPlace.address}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <MapLayers
              onLayerToggle={(layerId, enabled) => {
                console.log(`Capa ${layerId}: ${enabled ? 'ON' : 'OFF'}`);
              }}
            />
          </div>

          {/* Current Location Button */}
          <button
            className="absolute bottom-24 right-4 bg-white dark:bg-gray-800 p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
            title="Mi ubicación"
          >
            <NavigationIcon size={24} className="text-blue-600" />
          </button>

          {/* Zoom Controls */}
          <div className="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <button className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700 font-bold text-xl">
              +
            </button>
            <button className="block px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 font-bold text-xl">
              −
            </button>
          </div>
        </main>
      </div>

      {/* Place Details Modal */}
      {showDetails && selectedPlace && (
        <PlaceDetails
          place={selectedPlace}
          onClose={() => setShowDetails(false)}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
