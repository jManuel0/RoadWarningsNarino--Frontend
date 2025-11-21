// src/components/MapWithGps.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import { Alert, AlertSeverity } from "@/types/Alert";

interface MapWithGpsProps {
  alerts?: Alert[];
}

interface GeocoderEvent {
  geocode: {
    center: L.LatLng;
    name: string;
  };
}

interface RoutingWaypoint {
  latLng: L.LatLng;
}

const MapWithGps: React.FC<MapWithGpsProps> = ({ alerts = [] }) => {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const routingControlRef = useRef<L.Control | null>(null);
  const alertMarkersRef = useRef<L.Marker[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  // estado del buscador manual
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/64/64113.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const alertIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
  });

  // Trazar ruta
  const handleNavigate = useCallback(
    (destination: [number, number]) => {
      if (!mapRef.current || !userLocation) {
        alert("Activa tu GPS primero.");
        return;
      }
      if (routingControlRef.current) {
        routingControlRef.current.remove();
        routingControlRef.current = null;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      routingControlRef.current = (L.Routing as any)
        .control({
          waypoints: [
            L.latLng(userLocation[0], userLocation[1]),
            L.latLng(destination[0], destination[1]),
          ],
          lineOptions: { styles: [{ color: "blue", weight: 5, opacity: 0.7 }] },
          createMarker: (i: number, wp: RoutingWaypoint) =>
            L.marker(wp.latLng, { icon: i === 0 ? userIcon : alertIcon }),
          addWaypoints: false,
          draggableWaypoints: false,
          routeWhileDragging: false,
          show: false,
          language: "es",
        })
        .addTo(mapRef.current);
    },
    [userLocation, userIcon, alertIcon]
  );

  // Inicializar mapa + geocoder control
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("map-gps").setView([1.2136, -77.2811], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      mapRef.current = map;

      // Control de búsqueda (clic en resultado = trazar ruta)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Geocoder = (L.Control as any).geocoder;
      const geocoderControl = Geocoder({ defaultMarkGeocode: false });
      geocoderControl.on("markgeocode", (e: GeocoderEvent) => {
        const dest: L.LatLng = e.geocode.center;
        L.marker(dest, { icon: alertIcon })
          .addTo(map)
          .bindPopup(e.geocode.name)
          .openPopup();
        handleNavigate([dest.lat, dest.lng]);
      });
      geocoderControl.addTo(map);
    }
  }, [alertIcon, handleNavigate]);

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
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng(coords);
          } else {
            userMarkerRef.current = L.marker(coords, { icon: userIcon })
              .addTo(mapRef.current)
              .bindPopup("Estás aquí");
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
  }, [userIcon]);

  // Pintar alertas
  useEffect(() => {
    if (!mapRef.current) return;
    alertMarkersRef.current.forEach((m) => m.remove());
    alertMarkersRef.current = [];
    alerts.forEach((a) => {
      if (a.latitude == null || a.longitude == null) return;
      const marker = L.marker([a.latitude, a.longitude], {
        icon: alertIcon,
      }).addTo(mapRef.current!);
      marker.bindPopup(`
        <b>${a.title ?? "Alerta"}</b><br/>
        ${a.description ?? ""}<br/>
        <b>Ubicación:</b> ${a.location ?? ""}<br/>
        <b>Severidad:</b> ${a.severity}<br/>
        <b>Estado:</b> ${a.status}<br/>
        <button id="go-${a.id}" style="margin-top:6px;padding:6px 10px;border:none;border-radius:6px;background:#2563eb;color:#fff;cursor:pointer">Ir</button>
      `);
      marker.on("popupopen", () => {
        const btn = document.getElementById(`go-${a.id}`);
        btn?.addEventListener("click", () =>
          handleNavigate([a.latitude, a.longitude])
        );
      });
      alertMarkersRef.current.push(marker);
    });
  }, [alerts, alertIcon, handleNavigate]);

  const handleCenterMap = () => {
    if (mapRef.current && userLocation) mapRef.current.flyTo(userLocation, 15);
    else alert("Esperando señal GPS...");
  };

  // Buscador manual (Nominatim)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      setSearching(true);
      // Nominatim (sin API key). Respeta el 'format=json' y 'limit=1'
      const url = new URL("https://nominatim.openstreetmap.org/search");
      url.searchParams.set("q", query);
      url.searchParams.set("format", "json");
      url.searchParams.set("limit", "1");
      url.searchParams.set("addressdetails", "0");

      const res = await fetch(url.toString(), {
        headers: { "Accept-Language": "es" },
      });
      const data: Array<{ lat: string; lon: string; display_name: string }> =
        await res.json();
      if (!data.length) {
        alert("No se encontró ese lugar.");
        return;
      }
      const { lat, lon, display_name } = data[0];
      const dest: [number, number] = [parseFloat(lat), parseFloat(lon)];
      // marker + ruta
      if (mapRef.current) {
        L.marker(dest, { icon: alertIcon })
          .addTo(mapRef.current)
          .bindPopup(display_name)
          .openPopup();
      }
      handleNavigate(dest);
    } catch (err) {
      console.error(err);
      alert("Error buscando la dirección.");
    } finally {
      setSearching(false);
    }
  };

  const getSeverityClass = (severity: AlertSeverity) => {
    if (severity === AlertSeverity.CRITICA || severity === AlertSeverity.ALTA)
      return "bg-red-100 hover:bg-red-200";
    if (severity === AlertSeverity.MEDIA)
      return "bg-yellow-100 hover:bg-yellow-200";
    return "bg-green-100 hover:bg-green-200";
  };

  return (
    <div className="relative">
      <div
        id="map-gps"
        style={{ height: "90vh", width: "100%", borderRadius: "10px" }}
      />

      {/* Buscador manual arriba-izquierda */}
      <form
        onSubmit={handleSearch}
        className="absolute top-4 left-4 bg-white rounded-xl shadow-md p-2 flex gap-2 items-center w-[340px] max-w-[90vw]"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none"
          placeholder="Buscar lugar o dirección (ej. Plaza Nariño)"
        />
        <button
          type="submit"
          disabled={searching}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-60"
        >
          {searching ? "Buscando..." : "Ir"}
        </button>
      </form>

      {/* Botón centrar */}
      <button
        onClick={handleCenterMap}
        className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700"
      >
        📍 Centrar en mi ubicación
      </button>

      {/* Lista de alertas */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-xl shadow-lg max-h-60 overflow-y-auto w-72">
        <h3 className="font-bold mb-2 text-gray-800">Alertas cercanas</h3>
        {alerts.length > 0 ? (
          alerts.map((a) => {
            if (a.latitude == null || a.longitude == null) return null;
            return (
              <button
                key={a.id}
                onClick={() => handleNavigate([a.latitude, a.longitude])}
                className={`block w-full text-left px-3 py-2 mb-1 rounded-lg text-sm ${getSeverityClass(a.severity)}`}
              >
                <div className="font-semibold truncate">
                  {a.title || "Alerta sin título"}
                </div>
                <div className="text-xs text-gray-700 truncate">
                  {a.location || "Sin ubicación detallada"}
                </div>
                <div className="text-[10px] text-gray-500">
                  {a.severity} • {a.status}
                </div>
              </button>
            );
          })
        ) : (
          <p className="text-sm text-gray-600">Sin alertas disponibles</p>
        )}
      </div>

      {error && (
        <div className="absolute top-20 left-4 bg-red-600 text-white px-3 py-2 rounded-md shadow-lg text-sm max-w-xs">
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};

export default MapWithGps;
