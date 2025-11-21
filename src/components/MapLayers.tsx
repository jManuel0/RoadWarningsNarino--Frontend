// src/components/MapLayers.tsx
import { useState } from 'react';
import { Layers, TrendingUp, Bus, Bike, Mountain, Satellite, AlertTriangle } from 'lucide-react';

interface MapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
  description: string;
}

interface MapLayersProps {
  onLayerToggle: (layerId: string, enabled: boolean) => void;
}

export default function MapLayers({ onLayerToggle }: MapLayersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'traffic',
      name: 'Tráfico',
      icon: <TrendingUp size={20} />,
      enabled: true,
      description: 'Muestra el estado del tráfico en tiempo real'
    },
    {
      id: 'alerts',
      name: 'Alertas Viales',
      icon: <AlertTriangle size={20} />,
      enabled: true,
      description: 'Incidentes y alertas reportadas'
    },
    {
      id: 'transit',
      name: 'Transporte Público',
      icon: <Bus size={20} />,
      enabled: false,
      description: 'Rutas de buses y paradas'
    },
    {
      id: 'bicycling',
      name: 'Ciclovías',
      icon: <Bike size={20} />,
      enabled: false,
      description: 'Rutas y carriles para bicicletas'
    },
    {
      id: 'terrain',
      name: 'Terreno',
      icon: <Mountain size={20} />,
      enabled: false,
      description: 'Vista de elevación y relieve'
    },
    {
      id: 'satellite',
      name: 'Satélite',
      icon: <Satellite size={20} />,
      enabled: false,
      description: 'Imágenes satelitales'
    }
  ]);

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        const newEnabled = !layer.enabled;
        onLayerToggle(layerId, newEnabled);
        return { ...layer, enabled: newEnabled };
      }
      return layer;
    }));
  };

  const activeLayersCount = layers.filter(l => l.enabled).length;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white dark:bg-gray-800 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all relative"
        title="Capas del mapa"
      >
        <Layers size={24} className="text-gray-700 dark:text-gray-300" />
        {activeLayersCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeLayersCount}
          </span>
        )}
      </button>

      {/* Layers Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white">
                Capas del Mapa
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Personaliza la información visible en el mapa
              </p>
            </div>

            {/* Layers List */}
            <div className="max-h-96 overflow-y-auto">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-2 rounded-lg ${
                      layer.enabled 
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                        : 'bg-gray-100 text-gray-400 dark:bg-gray-700 dark:text-gray-500'
                    }`}>
                      {layer.icon}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {layer.name}
                        </span>
                        
                        {/* Toggle Switch */}
                        <div className={`relative w-11 h-6 rounded-full transition-colors ${
                          layer.enabled 
                            ? 'bg-blue-600' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                            layer.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {layer.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  layers.forEach(layer => {
                    if (layer.enabled) {
                      toggleLayer(layer.id);
                    }
                  });
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Desactivar todas las capas
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
