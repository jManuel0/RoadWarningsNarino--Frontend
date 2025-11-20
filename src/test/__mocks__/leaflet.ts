// Mock Leaflet
export const map = jest.fn(() => ({
  setView: jest.fn().mockReturnThis(),
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  invalidateSize: jest.fn(),
  fitBounds: jest.fn(),
  panTo: jest.fn(),
  getCenter: jest.fn(() => ({ lat: 1.2136, lng: -77.2811 })),
  getZoom: jest.fn(() => 13),
}));

export const tileLayer = jest.fn(() => ({
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
}));

export const marker = jest.fn(() => ({
  addTo: jest.fn().mockReturnThis(),
  setLatLng: jest.fn().mockReturnThis(),
  bindPopup: jest.fn().mockReturnThis(),
  openPopup: jest.fn().mockReturnThis(),
  remove: jest.fn(),
}));

export const icon = jest.fn(() => ({}));
export const divIcon = jest.fn(() => ({}));

export const circle = jest.fn(() => ({
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
}));

export const polygon = jest.fn(() => ({
  addTo: jest.fn().mockReturnThis(),
  remove: jest.fn(),
}));

export const layerGroup = jest.fn(() => ({
  addTo: jest.fn().mockReturnThis(),
  clearLayers: jest.fn(),
  addLayer: jest.fn(),
  removeLayer: jest.fn(),
}));

export const LatLng = jest.fn((lat, lng) => ({ lat, lng }));
export const LatLngBounds = jest.fn(() => ({
  extend: jest.fn(),
  isValid: jest.fn(() => true),
}));

export default {
  map,
  tileLayer,
  marker,
  icon,
  divIcon,
  circle,
  polygon,
  layerGroup,
  LatLng,
  LatLngBounds,
};
