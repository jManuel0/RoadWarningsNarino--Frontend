import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import { Alert, AlertSeverity } from '@/types/Alert';

interface HeatMapLayerProps {
  alerts: Alert[];
  enabled: boolean;
}

// Extend Leaflet types to include heatLayer
declare module 'leaflet' {
  function heatLayer(
    latlngs: [number, number, number][],
    options?: any
  ): L.Layer;
}

export default function HeatMapLayer({ alerts, enabled }: HeatMapLayerProps) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !map) return;

    // Prepare heat map data: [lat, lng, intensity]
    const heatData: [number, number, number][] = alerts
      .filter(alert => alert.latitude && alert.longitude)
      .map(alert => {
        // Calculate intensity based on severity
        const intensity = {
          [AlertSeverity.CRITICA]: 1,
          [AlertSeverity.ALTA]: 0.7,
          [AlertSeverity.MEDIA]: 0.4,
          [AlertSeverity.BAJA]: 0.2,
        }[alert.severity] || 0.5;

        return [alert.latitude, alert.longitude, intensity];
      });

    if (heatData.length === 0) return;

    // Create heat layer with custom styling
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 35,
      blur: 25,
      maxZoom: 17,
      max: 1,
      gradient: {
        0: '#00ff00',  // Green (safe)
        0.3: '#ffff00',  // Yellow (low risk)
        0.5: '#ffa500',  // Orange (medium risk)
        0.7: '#ff6600',  // Dark orange (high risk)
        1: '#ff0000',  // Red (critical)
      },
    });

    heatLayer.addTo(map);

    // Cleanup function
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [alerts, enabled, map]);

  return null;
}
