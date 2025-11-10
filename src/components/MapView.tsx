import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Alert } from "@/types/Alert";

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId?: number | null;
  onSelectAlert?: (id: number) => void;
}

const MapView: React.FC<MapViewProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("alerts-map").setView([1.2136, -77.2811], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapRef.current = map;
    }
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Limpia marcadores anteriores
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    alerts.forEach((alert) => {
      if (alert.latitude == null || alert.longitude == null) return;

      const marker = L.marker([alert.latitude, alert.longitude]).addTo(
        mapRef.current as L.Map
      );

      marker.bindPopup(
        `
        <b>${alert.title}</b><br/>
        ${alert.description || ""}<br/>
        <b>Ubicación:</b> ${alert.location || ""}<br/>
        <b>Severidad:</b> ${alert.severity}<br/>
      `
      );

      marker.on("click", () => {
        onSelectAlert?.(alert.id);
      });

      markersRef.current.push(marker);
    });
  }, [alerts, onSelectAlert]);

  useEffect(() => {
    if (!mapRef.current || !selectedAlertId) return;

    const alert = alerts.find((a) => a.id === selectedAlertId);
    if (alert?.latitude == null || alert.longitude == null) return;

    mapRef.current.flyTo([alert.latitude, alert.longitude], 14);
  }, [selectedAlertId, alerts]);

  return (
    <div
      id="alerts-map"
      className="w-full h-[500px] rounded-lg shadow"
    />
  );
};

export default MapView;
