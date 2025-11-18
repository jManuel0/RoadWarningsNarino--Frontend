import { useEffect, useMemo, useRef } from "react";
import { useMap } from "@vis.gl/react-google-maps";

interface PolylineOverlayProps {
  path: google.maps.LatLngLiteral[];
  options?: google.maps.PolylineOptions;
}

/**
 * Imperatively draws a Google Maps polyline inside the current <Map /> context.
 * Keeps React tree clean while still reacting to prop changes.
 */
const PolylineOverlay = ({ path, options }: PolylineOverlayProps) => {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  const normalizedPath = useMemo(
    () => path.filter((point): point is google.maps.LatLngLiteral => !!point),
    [path]
  );

  const normalizedOptions = useMemo(() => options ?? {}, [options]);

  useEffect(() => {
    if (!map || normalizedPath.length < 2) return;

    polylineRef.current ??= new google.maps.Polyline();

    polylineRef.current.setOptions({
      map,
      path: normalizedPath,
      ...normalizedOptions,
    });

    return () => {
      polylineRef.current?.setMap(null);
      polylineRef.current = null;
    };
  }, [map, normalizedPath, normalizedOptions]);

  return null;
};

export default PolylineOverlay;
