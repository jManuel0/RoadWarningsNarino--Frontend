// src/components/SavedPlaces.tsx
import { useState, useEffect } from 'react';
import { Home, Briefcase, Heart, MapPin, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface SavedPlace {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: 'home' | 'work' | 'favorite';
  icon?: string;
}

interface SavedPlacesProps {
  onPlaceSelect: (place: SavedPlace) => void;
}

export default function SavedPlaces({ onPlaceSelect }: SavedPlacesProps) {
  const [places, setPlaces] = useState<SavedPlace[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadSavedPlaces();
  }, []);

  const loadSavedPlaces = () => {
    const saved = localStorage.getItem('saved-places');
    if (saved) {
      try {
        setPlaces(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading saved places:', error);
      }
    }
  };

  const savePlaces = (updatedPlaces: SavedPlace[]) => {
    localStorage.setItem('saved-places', JSON.stringify(updatedPlaces));
    setPlaces(updatedPlaces);
  };

  const addPlace = (place: Omit<SavedPlace, 'id'>) => {
    const newPlace: SavedPlace = {
      ...place,
      id: Date.now().toString(),
    };
    savePlaces([...places, newPlace]);
    toast.success('Lugar guardado');
    setIsAdding(false);
  };

  const deletePlace = (id: string) => {
    savePlaces(places.filter(p => p.id !== id));
    toast.success('Lugar eliminado');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home size={20} />;
      case 'work': return <Briefcase size={20} />;
      case 'favorite': return <Heart size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'home': return 'Casa';
      case 'work': return 'Trabajo';
      case 'favorite': return 'Favorito';
      default: return 'Lugar';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'home': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'work': return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'favorite': return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          Lugares guardados
        </h3>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Agregar
        </button>
      </div>

      {places.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center">
          <MapPin className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No tienes lugares guardados
          </p>
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Agregar tu primer lugar
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {places.map((place) => (
            <div
              key={place.id}
              className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className={`p-3 rounded-lg ${getTypeColor(place.type)}`}>
                  {getIcon(place.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {getTypeLabel(place.type)}
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                        {place.name}
                      </h4>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => setEditingId(place.id)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deletePlace(place.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-3">
                    {place.address}
                  </p>
                  
                  <button
                    onClick={() => onPlaceSelect(place)}
                    className="w-full px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-sm font-medium"
                  >
                    Ir aquí
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Place Modal - Simplified version */}
      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Agregar lugar
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addPlace({
                  name: formData.get('name') as string,
                  address: formData.get('address') as string,
                  lat: parseFloat(formData.get('lat') as string),
                  lng: parseFloat(formData.get('lng') as string),
                  type: formData.get('type') as 'home' | 'work' | 'favorite',
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo
                </label>
                <select
                  name="type"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="home">Casa</option>
                  <option value="work">Trabajo</option>
                  <option value="favorite">Favorito</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Ej: Mi casa"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="Ej: Calle 18 #25-04, Pasto"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    name="lat"
                    step="any"
                    required
                    placeholder="1.2136"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    name="lng"
                    step="any"
                    required
                    placeholder="-77.2811"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
