// src/components/MapWithGps.tsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Alert } from "../types/Alert";
import { toast } from "sonner";

interface MapWithGpsProps {
  alerts?: Alert[]; // alertas que vienen desde el padre (GpsPage)
}

const MapWithGps: React.FC<MapWithGpsProps> = ({ alerts = [] }) => {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null); // leaflet-routing-machine no trae tipos buenos
  const alertMarkersRef = useRef<L.Marker[]>([]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Icono usuario
  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Icono alerta
  const alertIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([1.2136, -77.2811], 13);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
    }
  }, []);

  // Geolocalización en tiempo real
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const coords: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setUserLocation(coords);
        setError(null);

        if (mapRef.current) {
          mapRef.current.flyTo(coords, 15);

          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
          } else {
            userMarkerRef.current = L.marker(coords, {
              icon: userIcon,
            }).addTo(mapRef.current);
          }
        }
      },
      (err) => {
        console.error(err);
        setError("No se pudo obtener la ubicación. Verifica permisos de GPS.");
      },
      { enableHighAccuracy: true, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Pintar marcadores de alertas cuando cambian las props
  useEffect(() => {
    if (!mapRef.current) return;

    console.log("Total alertas recibidas:", alerts.length, alerts);

    // Limpiar marcadores previos
    alertMarkersRef.current.forEach((m) => m.remove());
    alertMarkersRef.current = [];

    // Filtrar alertas con coordenadas válidas
    const validAlerts = alerts.filter((a) => {
      const valid =
        typeof a.latitude === "number" &&
        typeof a.longitude === "number" &&
        !Number.isNaN(a.latitude) &&
        !Number.isNaN(a.longitude);
      if (!valid) {
        console.warn("Alerta con coordenadas inválidas, se omite:", a);
      }
      return valid;
    });

    validAlerts.forEach((alert) => {
      const marker = L.marker([alert.latitude, alert.longitude], {
        icon: alertIcon,
      }).addTo(mapRef.current!);

      marker.bindPopup(`
        <b>${alert.title}</b><br>
        ${alert.description}<br>
        <b>Severidad:</b> ${alert.severity}<br>
        ${
          alert.timestamp
            ? `<b>Fecha:</b> ${new Date(alert.timestamp).toLocaleString()}<br>`
            : ""
        }
        ${
          alert.estimatedDuration
            ? `<b>Duración estimada:</b> ${alert.estimatedDuration} min<br>`
            : ""
        }
        <button id="navigate-${alert.id}">➡️ Navegar</button>
      `);

      marker.on("popupopen", () => {
        const btn = document.getElementById(`navigate-${alert.id}`);
        if (btn) {
          btn.onclick = () =>
            handleNavigate([alert.latitude, alert.longitude]);
        }
      });

      alertMarkersRef.current.push(marker);
    });

    // Ajustar el mapa para mostrar todas las alertas si hay al menos una
    if (alertMarkersRef.current.length > 0) {
      const group = L.featureGroup(alertMarkersRef.current);
      mapRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [alerts]);

  // Navegar desde la ubicación del usuario a una alerta o destino
  const handleNavigate = (destination: [number, number]) => {
    if (!mapRef.current || !userLocation) {
      toast("Debes activar tu GPS primero.");
      return;
    }

    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    // @ts-ignore: Routing se agrega por leaflet-routing-machine en runtime
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1]),
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 5, opacity: 0.7 }],
      },
      createMarker: (i: number, wp: { latLng: L.LatLngExpression }) =>
        L.marker(wp.latLng, { icon: i === 0 ? userIcon : alertIcon }),
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
    }).addTo(mapRef.current);
  };

  // Centrar mapa en usuario
  const handleCenterMap = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo(userLocation, 15);
    } else {
      toast("Esperando señal GPS...");
    }
  };

  // Buscar destino por texto y navegar (ej: "Parque Nariño", dirección, etc.)
  const handleSearchDestination = async () => {
    if (!searchQuery.trim()) {
      toast("Escribe un lugar para buscar.");
      return;
    }

    if (!userLocation) {
      toast("Activa el GPS para calcular la ruta desde tu ubicación.");
      return;
    }

    try {
      setIsSearching(true);
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        searchQuery.trim()
      )}`;
      const res = await fetch(url);
      const results = await res.json();

      if (!results || results.length === 0) {
        toast("No se encontró ese lugar. Intenta con otra dirección o nombre.");
        return;
      }

      const place = results[0];
      const lat = parseFloat(place.lat);
      const lon = parseFloat(place.lon);

      if (Number.isNaN(lat) || Number.isNaN(lon)) {
        toast("No se pudo interpretar la ubicación encontrada.");
        return;
      }

      handleNavigate([lat, lon]);
      if (mapRef.current) {
        mapRef.current.flyTo([lat, lon], 15);
      }
    } catch (error) {
      console.error(error);
      toast("Error al buscar el destino.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="relative">
      <div
        id="map"
        style={{ height: "90vh", width: "100%", borderRadius: "10px" }}
      />

      {/* Buscador de destino */}
      <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-lg shadow-md flex gap-2 items-center w-[260px]">
        <input
          type="text"
          placeholder="Buscar destino..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 text-sm outline-none"
        />
        <button
          onClick={handleSearchDestination}
          disabled={isSearching}
          className="text-sm bg-blue-600 text-white px-2 py-1 rounded-md hover:bg-blue-700 disabled:opacity-60"
        >
          Ir
        </button>
      </div>

      {/* Botón centrar en usuario */}
      <button
        onClick={handleCenterMap}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
      >
        📍 Centrar en mi ubicación
      </button>

      {/* Lista de alertas */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-lg max-h-60 overflow-y-auto">
        <h3 className="font-bold mb-2 text-gray-800">Alertas cercanas</h3>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() =>
                handleNavigate([alert.latitude, alert.longitude])
              }
              className={`block w-full text-left px-3 py-2 mb-1 rounded-lg ${
                alert.severity === "high"
                  ? "bg-red-100 hover:bg-red-200"
                  : alert.severity === "medium"
                  ? "bg-yellow-100 hover:bg-yellow-200"
                  : "bg-green-100 hover:bg-green-200"
              }`}
            >
              {alert.title} — {alert.severity.toUpperCase()}
            </button>
          ))
        ) : (
          <p className="text-sm text-gray-600">Sin alertas disponibles</p>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="absolute top-20 left-4 bg-red-600 text-white px-3 py-2 rounded-md shadow-lg">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default MapWithGps;
