// src/pages/GpsPage.tsx
import React, { useEffect, useState } from "react";
import MapWithGps from "../components/MapWithGps";
import { Alert } from "../types/Alert";

const GpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetch("http://localhost:8080/alert")
 // ajusta la URL a tu backend real
      .then((res) => res.json())
      .then((data: Alert[]) => setAlerts(data))
      .catch((err) => console.error("Error fetching alerts:", err));
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <MapWithGps alerts={alerts} />
    </div>
  );
};

export default GpsPage;

