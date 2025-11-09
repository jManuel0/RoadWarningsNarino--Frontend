// src/components/MapWithGps.tsx
import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Alert } from "../types/Alert";
import { toast } from "sonner";

interface MapWithGpsProps {
  alerts?: Alert[]; // alertas que vienen desde el padre
}

const MapWithGps: React.FC<MapWithGpsProps> = ({ alerts = [] }) => {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<any>(null); // leaflet-routing-machine no tiene buenos tipos
  const alertMarkersRef = useRef<L.Marker[]>([]);

  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const map = L.map("map").setView([1.2136, -77.2811], 13); // centro inicial
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

    // Limpiar marcadores previos
    alertMarkersRef.current.forEach((m) => m.remove());
    alertMarkersRef.current = [];

    alerts.forEach((alert) => {
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
  }, [alerts]);

  // Navegar desde la ubicación del usuario a una alerta
  const handleNavigate = (destination: [number, number]) => {
    if (!mapRef.current || !userLocation) {
      toast("Debes activar tu GPS primero.");
      return;
    }

    // eliminar ruta previa si existe
    if (routingControlRef.current) {
      routingControlRef.current.remove();
      routingControlRef.current = null;
    }

    // @ts-ignore: Routing viene de leaflet-routing-machine en runtime
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

  return (
    <div className="relative">
      <div
        id="map"
        style={{ height: "90vh", width: "100%", borderRadius: "10px" }}
      />

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
