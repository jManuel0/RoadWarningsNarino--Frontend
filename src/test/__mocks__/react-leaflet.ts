import type { ReactNode } from "react";

const noop = () => {};

export const MapContainer = ({ children }: { children?: ReactNode }) => (
  <div>{children}</div>
);

export const TileLayer = () => <div />;
export const Marker = () => <div />;
export const Polyline = () => <div />;
export const Circle = () => <div />;

export const useMap = () => ({
  addLayer: noop,
  removeLayer: noop,
  remove: noop,
  flyTo: noop,
  setView: noop,
  invalidateSize: noop,
  on: noop,
});

export const useMapEvents = () => ({});
export const useMapEvent = () => ({});
