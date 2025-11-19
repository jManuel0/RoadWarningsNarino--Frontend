// src/api/baseUrl.ts
// Base de la API para TODAS las llamadas HTTP.
// Debe apuntar SIEMPRE al context-path del backend, es decir, incluir `/api`.
// Ejemplos:
// - Desarrollo: http://localhost:8080/api
// - Producción: https://roadwarningsnarino-backend.onrender.com/api
//
// En Vite, configura:
//   VITE_API_URL = "https://roadwarningsnarino-backend.onrender.com/api"
// y el código usará esa URL como base.
export const API_BASE =
  (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace(
    /\/$/,
    ""
  );

