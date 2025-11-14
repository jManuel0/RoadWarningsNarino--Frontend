import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";
import { Alert, AlertSeverity } from "@/types/Alert";

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId?: number | null;
  onSelectAlert?: (id: number) => void;
}

// Iconos personalizados por severidad
const getMarkerIcon = (severity: AlertSeverity) => {
  const colors = {
    [AlertSeverity.CRITICA]: '#dc2626',
    [AlertSeverity.ALTA]: '#ea580c',
    [AlertSeverity.MEDIA]: '#facc15',
    [AlertSeverity.BAJA]: '#3b82f6',
  };

  const color = colors[severity] || '#6b7280';

  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 18px;
        ">!</div>
      </div>
    `,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

const MapView: React.FC<MapViewProps> = ({
  alerts,
  selectedAlertId,
  onSelectAlert,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const clusterGroupRef = useRef<L.MarkerClusterGroup | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.map("alerts-map").setView([1.2136, -77.2811], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      // Crear grupo de clustering con configuración personalizada
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const childCount = cluster.getChildCount();
          const markers = cluster.getAllChildMarkers();

          // Determinar si hay alertas críticas en el cluster
          const hasCritical = markers.some((m: any) =>
            m.options.alert?.severity === AlertSeverity.CRITICA
          );

          const color = hasCritical ? '#dc2626' : '#3b82f6';
          const size = childCount < 10 ? 'small' : childCount < 100 ? 'medium' : 'large';
          const dimension = size === 'small' ? 40 : size === 'medium' ? 50 : 60;

          return L.divIcon({
            html: `
              <div style="
                background: ${color};
                width: ${dimension}px;
                height: ${dimension}px;
                border-radius: 50%;
                border: 4px solid white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                color: white;
                font-size: ${size === 'large' ? '18px' : '16px'};
                ${hasCritical ? 'animation: pulse 2s infinite;' : ''}
              ">
                ${childCount}
              </div>
            `,
            className: 'marker-cluster-custom',
            iconSize: [dimension, dimension],
          });
        },
      });

      map.addLayer(clusterGroup);
      clusterGroupRef.current = clusterGroup;
      mapRef.current = map;
    }
  }, []);

  // Actualizar marcadores con clustering
  useEffect(() => {
    if (!mapRef.current || !clusterGroupRef.current) return;

    // Limpiar marcadores anteriores del cluster
    clusterGroupRef.current.clearLayers();

    alerts.forEach((alert) => {
      if (alert.latitude == null || alert.longitude == null) return;

      const marker = L.marker([alert.latitude, alert.longitude], {
        icon: getMarkerIcon(alert.severity),
      });

      // Guardar la alerta en el marker para acceder desde el cluster
      (marker as any).alert = alert;

      marker.bindPopup(
        `
        <div style="min-width: 200px;">
          <b style="font-size: 16px; color: #1f2937;">${alert.title}</b><br/>
          <p style="margin: 8px 0; color: #4b5563;">${alert.description || ""}</p>
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
            <b style="color: #6b7280;">Ubicación:</b> ${alert.location || ""}<br/>
            <b style="color: #6b7280;">Severidad:</b> <span style="
              background: ${alert.severity === AlertSeverity.CRITICA ? '#fecaca' :
                         alert.severity === AlertSeverity.ALTA ? '#fed7aa' :
                         alert.severity === AlertSeverity.MEDIA ? '#fef08a' : '#bfdbfe'};
              color: ${alert.severity === AlertSeverity.CRITICA ? '#991b1b' :
                       alert.severity === AlertSeverity.ALTA ? '#9a3412' :
                       alert.severity === AlertSeverity.MEDIA ? '#854d0e' : '#1e40af'};
              padding: 2px 8px;
              border-radius: 4px;
              font-weight: 600;
            ">${alert.severity}</span>
          </div>
        </div>
      `
      );

      marker.on("click", () => {
        onSelectAlert?.(alert.id);
      });

      clusterGroupRef.current!.addLayer(marker);
    });
  }, [alerts, onSelectAlert]);

  useEffect(() => {
    if (!mapRef.current || !selectedAlertId) return;

    const alert = alerts.find((a) => a.id === selectedAlertId);
    if (alert?.latitude == null || alert.longitude == null) return;

    mapRef.current.flyTo([alert.latitude, alert.longitude], 14);
  }, [selectedAlertId, alerts]);

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.05);
          }
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .marker-cluster-custom {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
      <div
        id="alerts-map"
        className="w-full h-[500px] rounded-lg shadow"
      />
    </>
  );
};

export default MapView;
