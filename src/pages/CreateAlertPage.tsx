import React, { useState } from "react";
import LocationPickerMap from "../components/LocationPickerMap";

const CreateAlertPage: React.FC = () => {
  const [priority, setPriority] = useState("ALTA");
  const [type, setType] = useState("ACCIDENTE"); // ajusta a tus enums
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("Pasto");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<
    number | undefined
  >();

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("El título es obligatorio.");
      return;
    }

    // Validaciones opcionales deshabilitadas
    // if (!location.trim()) {
    //   alert("La dirección es obligatoria.");
    //   return;
    // }

    // if (!municipality.trim()) {
    //   alert("El municipio es obligatorio.");
    //   return;
    // }

    if (latitude == null || longitude == null) {
      alert("Por favor selecciona la ubicación en el mapa.");
      return;
    }

    const body = {
      type, // AlertType (enum en backend)
      title,
      description,
      latitude,
      longitude,
      location,
      municipality,
      severity: priority, // AlertSeverity (ALTA/MEDIA/BAJA)
      estimatedDuration,
      imageUrl: null,
    };

    const res = await fetch("http://localhost:8080/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const msg = await res.text();
      console.error(msg);
      alert("Error al crear la alerta");
      return;
    }

    alert("Alerta creada correctamente");
    // aquí puedes limpiar el form o redirigir
  };

  return (
    <div style={{ maxWidth: 600, margin: "20px auto" }}>
      <h2 style={{ marginBottom: 16 }}>Crear Alerta</h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 10 }}
      >
        {/* Tipo */}
        <label>
          Tipo de alerta *
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="ACCIDENTE">Accidente</option>
            <option value="DERRUMBE">Derrumbe</option>
            <option value="INUNDACION">Inundación</option>
            <option value="CIERRE_VIAL">Cierre vial</option>
            <option value="MANTENIMIENTO">Mantenimiento</option>
          </select>
        </label>

        {/* Prioridad / Severidad */}
        <label>
          Severidad *
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="ALTA">Alta</option>
            <option value="MEDIA">Media</option>
            <option value="BAJA">Baja</option>
          </select>
        </label>

        {/* Título */}
        <label>
          Título *
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Accidente vehicular"
            required
          />
        </label>

        {/* Descripción */}
        <label>
          Descripción
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles de la alerta..."
            maxLength={1000}
          />
        </label>

        {/* Dirección */}
        <label>
          Dirección *
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ej: Calle 18 con Carrera 25"
          />
        </label>

        {/* Municipio */}
        <label>
          Municipio *
          <select
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
          >
            <option value="Pasto">Pasto</option>
            <option value="Ipiales">Ipiales</option>
            <option value="Tumaco">Tumaco</option>
            <option value="Tuquerres">Túquerres</option>
            <option value="Sandona">Sandoná</option>
            {/* agrega más según necesites */}
          </select>
        </label>

        {/* Mapa */}
        <label>Selecciona la ubicación en el mapa *</label>
        <LocationPickerMap
          lat={latitude}
          lng={longitude}
          onChange={handleMapSelect}
        />

        {/* Coordenadas (solo lectura) */}
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label>Latitud</label>
            <input type="text" value={latitude ?? ""} readOnly />
          </div>
          <div style={{ flex: 1 }}>
            <label>Longitud</label>
            <input type="text" value={longitude ?? ""} readOnly />
          </div>
        </div>

        {/* Duración estimada */}
        <label>
          Duración estimada (minutos)
          <input
            type="number"
            min={0}
            value={estimatedDuration ?? ""}
            onChange={(e) =>
              setEstimatedDuration(
                e.target.value ? Number(e.target.value) : undefined
              )
            }
            placeholder="Opcional"
          />
        </label>

        <button type="submit" style={{ marginTop: 10 }}>
          Crear Alerta
        </button>
      </form>
    </div>
  );
};

export default CreateAlertPage;
