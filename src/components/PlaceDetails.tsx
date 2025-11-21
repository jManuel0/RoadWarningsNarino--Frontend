// src/components/PlaceDetails.tsx
import { useState } from 'react';
import { 
  X, Star, MapPin, Phone, Globe, Clock, Navigation, 
  Share2, Heart, Camera, ThumbsUp, MessageCircle 
} from 'lucide-react';
import { toast } from 'sonner';

interface PlaceDetailsProps {
  place: {
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
    priceLevel?: number;
  };
  onClose: () => void;
  onNavigate: () => void;
}

export default function PlaceDetails({ place, onClose, onNavigate }: PlaceDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'photos'>('overview');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: place.name,
          text: `${place.name} - ${place.address}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-blue-500 to-blue-700">
          {place.photos && place.photos.length > 0 ? (
            <img 
              src={place.photos[0]} 
              alt={place.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <MapPin size={64} className="text-white/50" />
            </div>
          )}
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <X size={20} />
          </button>

          {/* Photo Count */}
          {place.photos && place.photos.length > 1 && (
            <button className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
              <Camera size={16} />
              {place.photos.length} fotos
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Title Section */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {place.name}
                </h2>
                {place.category && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {place.category}
                  </span>
                )}
              </div>
              
              <button
                onClick={toggleFavorite}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <Heart 
                  size={24} 
                  className={isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}
                />
              </button>
            </div>

            {/* Rating */}
            {place.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-1">
                  <Star size={20} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {place.rating.toFixed(1)}
                  </span>
                </div>
                {place.totalReviews && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({place.totalReviews} reseñas)
                  </span>
                )}
                {place.priceLevel && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {'$'.repeat(place.priceLevel)}
                  </span>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onNavigate}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Navigation size={20} />
                Cómo llegar
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Información
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'reviews'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Reseñas
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`flex-1 px-4 py-3 font-medium transition-colors ${
                  activeTab === 'photos'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Fotos
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                      Dirección
                    </div>
                    <div className="text-gray-900 dark:text-white">
                      {place.address}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                {place.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Teléfono
                      </div>
                      <a 
                        href={`tel:${place.phone}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {place.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Website */}
                {place.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Sitio web
                      </div>
                      <a 
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Visitar sitio web
                      </a>
                    </div>
                  </div>
                )}

                {/* Hours */}
                {place.hours && (
                  <div className="flex items-start gap-3">
                    <Clock className="text-gray-400 flex-shrink-0 mt-1" size={20} />
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        Horario
                      </div>
                      <div className="text-gray-900 dark:text-white">
                        {place.hours}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                {/* Mock Reviews */}
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                        U{i}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          Usuario {i}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, j) => (
                            <Star 
                              key={j} 
                              size={14} 
                              className={j < 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                            />
                          ))}
                          <span className="text-xs text-gray-500 ml-1">
                            Hace {i} semana{i > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Excelente lugar, muy recomendado. El servicio es de primera calidad.
                        </p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                            <ThumbsUp size={14} />
                            <span>Útil</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-500 hover:text-blue-600">
                            <MessageCircle size={14} />
                            <span>Responder</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 gap-2">
                {place.photos && place.photos.length > 0 ? (
                  place.photos.map((photo, i) => (
                    <img
                      key={i}
                      src={photo}
                      alt={`${place.name} ${i + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay fotos disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
