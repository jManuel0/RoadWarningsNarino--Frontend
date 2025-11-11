// src/components/CreateAlertForm.tsx
import React, { useState } from "react";
import { createAlert } from "@/api/alertApi";
import { AlertSeverity, AlertType } from "@/types/Alert";

export default function CreateAlertForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const [type] = useState(AlertType.DERRUMBE);
  const [severity] = useState(AlertSeverity.MEDIA);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Obtener ubicación actual
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
      },
      () => {
        setError("No se pudo obtener tu ubicación. Activa el GPS o permisos.");
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createAlert({
        title,
        description,
        type,
        severity,
        location,
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
      });
      alert("✅ Alerta creada correctamente!");
      setTitle("");
      setDescription("");
      setLocation("");
    } catch (err) {
      setError("Error al crear la alerta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-bold mb-3">Crear nueva alerta</h2>

      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <input
        type="text"
        placeholder="Ubicación"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-full p-2 mb-2 border rounded"
      />

      <button
        type="button"
        onClick={handleUseMyLocation}
        className="bg-blue-500 text-white px-3 py-2 rounded mb-3"
      >
        📍 Usar mi ubicación actual
      </button>

      {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Enviando..." : "Crear alerta"}
      </button>
    </form>
  );
}
