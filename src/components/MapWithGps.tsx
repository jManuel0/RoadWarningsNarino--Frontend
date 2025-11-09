import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

interface Props {
  destination: { lat: number; lng: number };
}

const MapWithGPS: React.FC<Props> = ({ destination }) => {
  const mapRef = useRef<L.Map>(null!);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLatLng = L.latLng(
          position.coords.latitude,
          position.coords.longitude
        );

        map.setView(userLatLng, 13);

        L.marker(userLatLng)
          .addTo(map)
          .bindPopup("Tu ubicación actual")
          .openPopup();

        // ✅ L.Routing.control reconocido gracias al .d.ts
        L.Routing.control({
          waypoints: [userLatLng, L.latLng(destination.lat, destination.lng)],
          routeWhileDragging: true,
          showAlternatives: true,
          lineOptions: {
            styles: [{ color: "blue", opacity: 0.8, weight: 5 }],
          },
          createMarker: (_i: any, wp: { latLng: L.LatLngExpression; }) => L.marker(wp.latLng),
        }).addTo(map);
      },
      (error) => {
        console.error("Error al obtener ubicación:", error);
        alert("No se pudo acceder a tu ubicación.");
      }
    );
  }, [destination]);

  return (
    <MapContainer
      center={[1.2136, -77.2811]}
      zoom={12}
      style={{ height: "100vh", width: "100%" }}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[destination.lat, destination.lng]}>
        <Popup>Destino seleccionado</Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapWithGPS;

