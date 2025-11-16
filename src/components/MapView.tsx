import { useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map,
  useMap,
} from "@vis.gl/react-google-maps";
import { Alert, AlertSeverity } from "@/types/Alert";

interface MapViewProps {
  alerts: Alert[];
  selectedAlertId?: number | null;
  onSelectAlert?: (id: number) => void;
}

const DEFAULT_CENTER: google.maps.LatLngLiteral = {
  lat: 1.2136,
  lng: -77.2811,
};

const severityColors: Record<
  AlertSeverity,
  { background: string; badge: string; text: string }
> = {
  [AlertSeverity.CRITICA]: {
    background: "#dc2626",
    badge: "bg-red-100 text-red-800",
    text: "#991b1b",
  },
  [AlertSeverity.ALTA]: {
    background: "#ea580c",
    badge: "bg-orange-100 text-orange-800",
    text: "#9a3412",
  },
  [AlertSeverity.MEDIA]: {
    background: "#facc15",
    badge: "bg-yellow-100 text-yellow-800",
    text: "#854d0e",
  },
  [AlertSeverity.BAJA]: {
    background: "#3b82f6",
    badge: "bg-blue-100 text-blue-800",
    text: "#1e40af",
  },
};

const MarkerPin = ({
  severity,
  isSelected,
}: {
  severity: AlertSeverity;
  isSelected: boolean;
}) => {
  const style = severityColors[severity] ?? severityColors[AlertSeverity.BAJA];

  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-white shadow-lg transition-all ${
        isSelected ? "scale-110 shadow-2xl" : ""
      }`}
      style={{ backgroundColor: style.background }}
    >
      <span className="font-semibold text-lg">!</span>
    </div>
  );
};

interface MapContentProps extends MapViewProps {}

const MapContent = ({
  alerts,
  onSelectAlert,
  selectedAlertId,
}: MapContentProps) => {
  const map = useMap();
  const [infoAlertId, setInfoAlertId] = useState<number | null>(null);

  useEffect(() => {
    if (!map || !selectedAlertId) return;

    const alert = alerts.find((a) => a.id === selectedAlertId);
    if (alert?.latitude == null || alert.longitude == null) return;

    map.panTo({ lat: alert.latitude, lng: alert.longitude });
    const zoom = map.getZoom() ?? 11;
    if (zoom < 13) {
      map.setZoom(13);
    }
    setInfoAlertId(selectedAlertId);
  }, [alerts, map, selectedAlertId]);

  const activeAlert = useMemo(
    () => alerts.find((alert) => alert.id === infoAlertId) ?? null,
    [alerts, infoAlertId]
  );

  return (
    <>
      {alerts.map((alert) => {
        if (alert.latitude == null || alert.longitude == null) return null;

        const isSelected =
          alert.id === (infoAlertId ?? selectedAlertId ?? null);

        return (
          <AdvancedMarker
            key={alert.id}
            position={{ lat: alert.latitude, lng: alert.longitude }}
            clickable
            onClick={() => {
              setInfoAlertId(alert.id);
              onSelectAlert?.(alert.id);
            }}
          >
            <MarkerPin severity={alert.severity} isSelected={!!isSelected} />
          </AdvancedMarker>
        );
      })}

      {activeAlert?.latitude != null && activeAlert.longitude != null && (
        <InfoWindow
          position={{ lat: activeAlert.latitude, lng: activeAlert.longitude }}
          onClose={() => setInfoAlertId(null)}
        >
          <div className="min-w-[220px]">
            <p className="text-base font-semibold text-gray-900">
              {activeAlert.title}
            </p>
            {activeAlert.description && (
              <p className="mt-2 text-sm text-gray-600">
                {activeAlert.description}
              </p>
            )}
            <div className="mt-3 text-sm text-gray-600">
              <p className="font-medium text-gray-500">Ubicación:</p>
              <p>{activeAlert.location || "Sin descripción"}</p>
            </div>
            <div className="mt-3">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${severityColors[activeAlert.severity]?.badge}`}
              >
                Severidad: {activeAlert.severity}
              </span>
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const MapView = ({ alerts, selectedAlertId, onSelectAlert }: MapViewProps) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-lg border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
        Agrega la variable <code className="font-semibold">VITE_GOOGLE_MAPS_API_KEY</code>{" "}
        para visualizar el mapa.
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-[500px] w-full rounded-lg shadow">
        <Map
          defaultCenter={DEFAULT_CENTER}
          defaultZoom={11}
          mapId={import.meta.env.VITE_GOOGLE_MAPS_MAP_ID}
          gestureHandling="greedy"
          zoomControl
          style={{ width: "100%", height: "100%", borderRadius: "0.5rem" }}
        >
          <MapContent
            alerts={alerts}
            selectedAlertId={selectedAlertId}
            onSelectAlert={onSelectAlert}
          />
        </Map>
      </div>
    </APIProvider>
  );
};

export default MapView;
