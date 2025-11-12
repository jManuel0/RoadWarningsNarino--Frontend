import React, { useEffect, useState } from "react";
import MapWithGps from "../components/MapWithGps";
import { Alert } from "../types/Alert";

const GpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch("http://localhost:8080/alert", { signal: controller.signal }) // ← ajusta a tu backend real
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Alert[]) => setAlerts(data))
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching alerts:", err);
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <MapWithGps alerts={alerts} />
    </div>
  );
};

export default GpsPage;
