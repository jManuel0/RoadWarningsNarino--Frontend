import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("No se encontró el elemento #root");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// 🔹 Importante: NO registrar service workers aquí.
// 🔹 Si había uno viejo, lo intentamos desregistrar.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => {
      regs.forEach((reg) => {
        reg.unregister();
        console.log("🧹 Service Worker desregistrado:", reg);
      });
    })
    .catch((err) => {
      console.log("No se pudieron obtener los Service Workers:", err);
    });
}
