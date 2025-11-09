import React, { useEffect, useState, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { Alert } from "../types/Alert";

const MapWithGps: React.FC<{ alerts?: Alert[] }> = ({ alerts = [] }) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [routingControl, setRoutingControl] = useState<L.Routing.control | null>(null);

  // Icono personalizado del usuario
  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  // Icono para alertas
  const alertIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map").setView([1.2136, -77.2811], 13); // Pasto por defecto
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
    }
  }, []);

  // Obtener ubicación del usuario en tiempo real
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Tu navegador no soporta geolocalización.");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation(coords);
        setError(null);

        if (mapRef.current) {
          mapRef.current.setView(coords, 15);
          L.marker(coords, { icon: userIcon })
            .addTo(mapRef.current)
            .bindPopup("📍 Estás aquí")
            .openPopup();
        }
      },
      (err) => {
        console.error(err);
        setError("No se pudo obtener la ubicación. Verifica permisos de GPS.");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Mostrar alertas en el mapa
  useEffect(() => {
    if (!mapRef.current) return;

    alerts.forEach((alert) => {
      L.marker([alert.latitude, alert.longitude], { icon: alertIcon })
        .addTo(mapRef.current!)
        .bindPopup(
          `<b>${alert.title}</b><br>${alert.description}<br><b>Severidad:</b> ${alert.severity}`
        );
    });
  }, [alerts]);

  // Función para generar ruta desde tu ubicación hacia una alerta
  const handleNavigate = (destination: [number, number]) => {
    if (!mapRef.current || !userLocation) {
      alert("Debes activar tu GPS primero.");
      return;
    }

    if (routingControl) {
      routingControl.remove();
    }

    const newRoutingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1]),
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 5, opacity: 0.7 }],
      },
      createMarker: (i: number, wp: { latLng: L.LatLngExpression; }) => {
        return L.marker(wp.latLng, {
          icon: i === 0 ? userIcon : alertIcon,
        });
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      show: false,
    }).addTo(mapRef.current);

    setRoutingControl(newRoutingControl);
  };

  // Botón para centrar en tu ubicación
  const handleCenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 15);
    } else {
      alert("Esperando señal GPS...");
    }
  };

  return (
    <div className="relative">
      <div id="map" style={{ height: "90vh", width: "100%", borderRadius: "10px" }} />

      {/* Botón para centrar en usuario */}
      <button
        onClick={handleCenterMap}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
      >
        📍 Centrar en mi ubicación
      </button>

      {/* Botones para navegar hacia cada alerta */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-lg max-h-60 overflow-y-auto">
        <h3 className="font-bold mb-2 text-gray-800">Alertas cercanas</h3>
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => handleNavigate([alert.latitude, alert.longitude])}
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

      {error && (
        <div className="absolute top-20 left-4 bg-red-600 text-white px-3 py-2 rounded-md shadow-lg">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default MapWithGps;
