import React, { useState } from "react";
import LocationPickerMap from "../components/LocationPickerMap";

const CreateAlertPage: React.FC = () => {
  const [priority, setPriority] = useState("Alta");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [municipality, setMunicipality] = useState("Pasto");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | undefined>();

  const handleMapSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (latitude == null || longitude == null) {
      alert("Por favor selecciona la ubicación en el mapa.");
      return;
    }

    const body = {
      severity: priority,
      description,
      location,
      municipality,
      latitude,
      longitude,
      estimatedDuration,
    };

    await fetch("http://localhost:8080/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    alert("Alerta creada correctamente.");
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        maxWidth: "500px",
        margin: "auto",
      }}
    >
      <h2>Crear Alerta</h2>

      {/* Prioridad */}
      <label>Prioridad *</label>
      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
        <option value="Alta">Alta</option>
        <option value="Media">Media</option>
        <option value="Baja">Baja</option>
      </select>

      {/* Descripción */}
      <label>Descripción *</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Ej: Accidente vehicular."
        required
      />

      {/* Dirección */}
      <label>Dirección *</label>
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Ej: Calle 18 con Carrera 25"
        required
      />

      {/* Municipio */}
      <label>Municipio *</label>
      <select
        value={municipality}
        onChange={(e) => setMunicipality(e.target.value)}
      >
        <option value="Pasto">Pasto</option>
        <option value="Ipiales">Ipiales</option>
        <option value="Tumaco">Tumaco</option>
        <option value="Tuquerres">Túquerres</option>
        <option value="Sandoná">Sandoná</option>
      </select>

      {/* Mapa */}
      <label>Selecciona la ubicación en el mapa *</label>
      <LocationPickerMap lat={latitude} lng={longitude} onChange={handleMapSelect} />

      {/* Coordenadas */}
      <div style={{ display: "flex", gap: "8px" }}>
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
      <label>Duración Estimada (minutos)</label>
      <input
        type="number"
        min="0"
        placeholder="Opcional"
        value={estimatedDuration ?? ""}
        onChange={(e) => setEstimatedDuration(Number(e.target.value))}
      />

      <button type="submit" style={{ marginTop: "10px" }}>
        Crear Alerta
      </button>
    </form>
  );
};

export default CreateAlertPage;
