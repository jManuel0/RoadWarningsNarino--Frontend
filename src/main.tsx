// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Importar CSS de Leaflet (necesario para el sistema de mapas)
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Inicializar el tema desde el store antes de renderizar
const savedTheme = localStorage.getItem("settings-storage");
if (savedTheme) {
  try {
    const settings = JSON.parse(savedTheme);
    if (settings.state?.theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {
    console.error("Error loading theme:", error);
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No se encontró el elemento #root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Limpieza SW viejos, sin registrar nuevos
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((reg) => reg.unregister()))
    .catch((err: unknown) =>
      console.log("No se pudieron obtener los Service Workers:", err)
    );
}
