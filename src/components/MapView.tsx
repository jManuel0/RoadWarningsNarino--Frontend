import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Alert, AlertPriority } from '@/types/Alert';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MapViewProps {
  alerts: Alert[];
  center?: [number, number];
  zoom?: number;
  onAlertClick?: (alert: Alert) => void;
}

const priorityColors: Record<AlertPriority, string> = {
  [AlertPriority.CRITICA]: '#dc2626',
  [AlertPriority.ALTA]: '#ea580c',
  [AlertPriority.MEDIA]: '#facc15',
  [AlertPriority.BAJA]: '#3b82f6',
};

const priorityNames: Record<AlertPriority, string> = {
  [AlertPriority.CRITICA]: 'Crítica',
  [AlertPriority.ALTA]: 'Alta',
  [AlertPriority.MEDIA]: 'Media',
  [AlertPriority.BAJA]: 'Baja',
};

// Configurar iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView({ 
  alerts, 
  center = [1.2136, -77.2811],
  zoom = 13,
  onAlertClick 
}: Readonly<MapViewProps>) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Crear mapa
    mapRef.current = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Agregar capa de tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(mapRef.current);

    // Crear grupo de clustering con configuración avanzada
    markerClusterRef.current = L.markerClusterGroup({
      maxClusterRadius: 80,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: true,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 17,
      animate: true,
      animateAddingMarkers: true,
      iconCreateFunction: (cluster) => {
        const markers = cluster.getAllChildMarkers();
        
        // Contar por prioridad
        const criticalCount = markers.filter((m: any) => 
          m.options.alertPriority === AlertPriority.CRITICA
        ).length;
        const highCount = markers.filter((m: any) => 
          m.options.alertPriority === AlertPriority.ALTA
        ).length;

        // Determinar color del cluster
        let color = '#3b82f6'; // Azul por defecto
        if (criticalCount > 0) {
          color = '#dc2626'; // Rojo si hay críticas
        } else if (highCount > 0) {
          color = '#ea580c'; // Naranja si hay altas
        }

        const size = Math.min(40 + markers.length * 2, 70);

        return L.divIcon({
          html: `
            <div class="cluster-marker" style="
              background-color: ${color};
              width: ${size}px;
              height: ${size}px;
              border-radius: 50%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              border: 4px solid white;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              position: relative;
            ">
              <span style="font-size: ${size > 50 ? '20px' : '16px'};">${markers.length}</span>
              ${criticalCount > 0 ? `<span style="font-size: 10px; margin-top: -2px;">${criticalCount} críticas</span>` : ''}
            </div>
          `,
          className: 'custom-cluster-icon',
          iconSize: L.point(size, size),
        });
      },
    });

    mapRef.current.addLayer(markerClusterRef.current);

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
    if (!mapRef.current || !markerClusterRef.current) return;

    // Limpiar marcadores anteriores
    markerClusterRef.current.clearLayers();

    if (alerts.length === 0) return;

    // Agregar nuevos marcadores
    alerts.forEach(alert => {
      const color = priorityColors[alert.priority];
      
      // Crear icono personalizado
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${color};
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 3px 8px rgba(0,0,0,0.4);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: transform 0.2s ease;
          " onmouseover="this.style.transform='rotate(-45deg) scale(1.1)'" onmouseout="this.style.transform='rotate(-45deg) scale(1)'">
            <span style="
              transform: rotate(45deg);
              color: white;
              font-size: 20px;
              font-weight: bold;
            ">!</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const marker = L.marker([alert.location.lat, alert.location.lng], { 
        icon,
        alertPriority: alert.priority,
      } as any);

      // Popup mejorado
      const popupContent = `
        <div style="min-width: 250px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
          <div style="
            background: linear-gradient(135deg, ${color}15, ${color}05);
            border-left: 4px solid ${color};
            padding: 12px;
            margin: -12px -12px 12px -12px;
            border-radius: 4px 4px 0 0;
          ">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="
                background-color: ${color};
                color: white;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
              ">${priorityNames[alert.priority]}</span>
            </div>
            <h3 style="
              font-weight: bold;
              margin: 0;
              font-size: 18px;
              color: #1f2937;
            ">${alert.type.replace('_', ' ')}</h3>
          </div>
          
          <div style="padding: 4px 0;">
            <p style="
              margin: 0 0 12px 0;
              font-size: 14px;
              line-height: 1.5;
              color: #4b5563;
            ">${alert.description}</p>
            
            <div style="
              display: flex;
              align-items: start;
              gap: 8px;
              padding: 8px;
              background-color: #f3f4f6;
              border-radius: 6px;
              margin-bottom: 8px;
            ">
              <svg style="width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px;" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
              </svg>
              <span style="font-size: 13px; color: #4b5563;">${alert.location.address}</span>
            </div>
            
            ${alert.affectedRoads.length > 0 ? `
              <div style="margin-bottom: 8px;">
                <p style="
                  font-size: 12px;
                  font-weight: 600;
                  color: #6b7280;
                  margin: 0 0 4px 0;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                ">Vías Afectadas</p>
                <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                  ${alert.affectedRoads.map((road: any) => `
                    <span style="
                      font-size: 12px;
                      background-color: #e5e7eb;
                      color: #374151;
                      padding: 4px 8px;
                      border-radius: 4px;
                    ">${road}</span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            
            <div style="
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding-top: 8px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            ">
              <span>
                <svg style="width: 14px; height: 14px; display: inline; margin-right: 4px; vertical-align: middle;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                ${format(new Date(alert.timestamp), "dd MMM, HH:mm", { locale: es })}
              </span>
              ${alert.estimatedDuration ? `
                <span style="
                  background-color: #fef3c7;
                  color: #92400e;
                  padding: 2px 8px;
                  border-radius: 4px;
                  font-weight: 500;
                ">~${alert.estimatedDuration} min</span>
              ` : ''}
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 350,
        className: 'custom-popup'
      });

      if (onAlertClick) {
        marker.on('click', () => onAlertClick(alert));
      }

      markerClusterRef.current!.addLayer(marker);
    });

    // Ajustar vista del mapa a los marcadores
    if (alerts.length > 0 && mapRef.current) {
      const bounds = L.latLngBounds(
        alerts.map(alert => [alert.location.lat, alert.location.lng])
      );
      
      // Ajustar con padding
      mapRef.current.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15,
        animate: true,
      });
    }
  }, [alerts, onAlertClick]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg shadow-lg relative"
      style={{ minHeight: '500px' }}
    />
  );
}