// src/pages/GpsPage.tsx
import React, { useEffect, useState } from "react";
import MapWithGps from "@/components/MapWithGps";
import type { Alert } from "@/types/Alert";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const GpsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API}/api/alerts`, {
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Alert[] = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ height: "100vh" }}>
      <MapWithGps alerts={alerts} loading={loading} />
    </div>
  );
};

export default GpsPage;
