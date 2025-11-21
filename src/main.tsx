// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Importar CSS de Leaflet (necesario para el sistema de mapas)
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Global error handler
window.addEventListener("error", (event) => {
  console.error("Global error:", event.error);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// Inicializar el tema desde el store antes de renderizar
try {
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
} catch (error) {
  console.error("Error accessing localStorage:", error);
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-center: center; min-height: 100vh; padding: 20px; background: #f3f4f6;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">Error de Inicialización</h1>
        <p style="color: #374151;">No se encontró el elemento #root. Por favor, recarga la página.</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recargar Página
        </button>
      </div>
    </div>
  `;
  throw new Error("No se encontró el elemento #root");
}

try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error("Error rendering app:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; background: #f3f4f6;">
      <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #dc2626; margin-bottom: 10px;">Error al Cargar la Aplicación</h1>
        <p style="color: #374151; margin-bottom: 10px;">Ocurrió un error al inicializar la aplicación.</p>
        <pre style="background: #f9fafb; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px; color: #6b7280;">${error instanceof Error ? error.message : String(error)}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Recargar Página
        </button>
      </div>
    </div>
  `;
}

// Limpieza SW viejos, sin registrar nuevos
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((reg) => reg.unregister()))
    .catch((err: unknown) =>
      console.log("No se pudieron obtener los Service Workers:", err)
    );
}
