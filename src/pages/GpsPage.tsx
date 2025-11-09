import MapWithGPS from "../components/MapWithGps";

function GpsPage() {
    const destino = { lat: 1.2136, lng: -77.2811 }; // ejemplo: centro de Pasto

    return (
        <div style={{ height: "100vh" }}>
            <MapWithGPS destination={destino} />
        </div>
    );
}

export default GpsPage;
