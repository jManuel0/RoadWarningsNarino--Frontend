// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/contexts/ThemeContext";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("No se encontró el elemento #root");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
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
