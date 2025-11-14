// src/components/CreateAlertForm.tsx
import React, { useState } from "react";
import { createAlert } from "@/api/alertApi";
import { uploadApi } from "@/api/uploadApi";
import { AlertSeverity, AlertType } from "@/types/Alert";
import ImageUpload from "./ImageUpload";
import InteractiveLocationPicker from "./InteractiveLocationPicker";
import { notificationService } from "@/utils/notifications";
import { MapPin, Navigation2 } from "lucide-react";

export default function CreateAlertForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [type] = useState(AlertType.DERRUMBE);
  const [severity] = useState(AlertSeverity.MEDIA);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLatitude(lat);
    setLongitude(lng);
    setLocation(address);
    notificationService.success('Ubicación seleccionada correctamente');
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLatitude(latitude);
        setLongitude(longitude);
        setLocation(`Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`);
        notificationService.success('Ubicación obtenida');
      },
      () => {
        setError("No se pudo obtener tu ubicación. Activa el GPS o permisos.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let imageUrl: string | undefined;

      // Subir imagen primero si existe
      if (imageFile) {
        try {
          const uploadResult = await uploadApi.uploadImage(imageFile);
          imageUrl = uploadResult.url;
        } catch (uploadError) {
          console.error("Error subiendo imagen:", uploadError);
          notificationService.error("No se pudo subir la imagen, pero la alerta se creará sin ella");
        }
      }

      // Crear alerta
      await createAlert({
        title,
        description,
        type,
        severity,
        location,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        imageUrl,
      });

      notificationService.success("Alerta creada correctamente");

      // Limpiar formulario
      setTitle("");
      setDescription("");
      setLocation("");
      setLatitude(null);
      setLongitude(null);
      handleImageRemove();
    } catch (err) {
      console.error("Error al crear alerta:", err);
      setError("Error al crear la alerta.");
      notificationService.error("No se pudo crear la alerta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-800 shadow rounded-lg space-y-4">
      <h2 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">Crear nueva alerta</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        required
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        rows={4}
        required
      />

      {/* Location Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Ubicación
        </label>
        <input
          type="text"
          placeholder="Ubicación de la alerta"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          required
          readOnly
        />
      </div>

      {/* Location Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setShowLocationPicker(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white px-4 py-3 rounded-lg transition-all hover:shadow-lg font-medium"
        >
          <MapPin size={20} />
          Marcar en el Mapa
        </button>

        <button
          type="button"
          onClick={handleUseMyLocation}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-700 dark:to-green-900 text-white px-4 py-3 rounded-lg transition-all hover:shadow-lg font-medium"
        >
          <Navigation2 size={20} />
          Mi Ubicación Actual
        </button>
      </div>

      {/* Show coordinates if available */}
      {latitude && longitude && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            📍 Coordenadas: {latitude.toFixed(5)}, {longitude.toFixed(5)}
          </p>
        </div>
      )}

      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Imagen (opcional)
        </label>
        <ImageUpload
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          preview={imagePreview}
        />
      </div>

      {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-3 rounded-lg transition-all hover:shadow-lg font-medium"
      >
        {loading ? "Enviando..." : "Crear alerta"}
      </button>

      {/* Interactive Location Picker Modal */}
      {showLocationPicker && (
        <InteractiveLocationPicker
          onLocationSelect={handleLocationSelect}
          onClose={() => setShowLocationPicker(false)}
          initialLat={latitude ?? undefined}
          initialLng={longitude ?? undefined}
        />
      )}
    </form>
  );
}
