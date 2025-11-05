import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Alert, AlertPriority } from '@/types/Alert';

interface MapViewProps {
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  onAlertClick?: (alert: Alert) => void;
}

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const priorityColors: Record<AlertPriority, string> = {
  [AlertPriority.CRITICA]: '#dc2626',
  [AlertPriority.ALTA]: '#ea580c',
  [AlertPriority.MEDIA]: '#facc15',
  [AlertPriority.BAJA]: '#3b82f6',
};

export default function MapView({ 
  alerts, 
  center = [1.2136, -77.2811], // Pasto, Nariño
  zoom = 13,
  onAlertClick 
}: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Crear mapa
    mapRef.current = L.map(mapContainerRef.current).setView(center, zoom);

    // Agregar capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [center, zoom]);

  // Actualizar marcadores cuando cambien las alertas
  useEffect(() => {
    if (!mapRef.current) return;

    // Limpiar marcadores anteriores
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Agregar nuevos marcadores
    alerts.forEach(alert => {
      if (!mapRef.current) return;

      const color = priorityColors[alert.priority];
      
      // Crear icono personalizado
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
            ">!</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
      });

      const marker = L.marker([alert.location.lat, alert.location.lng], { icon })
        .addTo(mapRef.current!)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="font-weight: bold; margin-bottom: 8px;">${alert.type}</h3>
            <p style="margin-bottom: 4px;">${alert.description}</p>
            <p style="font-size: 12px; color: #666;">${alert.location.address}</p>
          </div>
        `);

      if (onAlertClick) {
        marker.on('click', () => onAlertClick(alert));
      }

      markersRef.current.push(marker);
    });

    // Ajustar vista si hay alertas
    if (alerts.length > 0) {
      const bounds = L.latLngBounds(
        alerts.map(alert => [alert.location.lat, alert.location.lng])
      );
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [alerts, onAlertClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg shadow-lg"
      style={{ minHeight: '400px' }}
    />
  );
}