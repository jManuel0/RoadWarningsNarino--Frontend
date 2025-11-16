// src/api/baseUrl.ts
// Base de la API para TODAS las llamadas HTTP.
// Debe apuntar SIEMPRE a la raíz del backend, sin `/api` al final.
// Ejemplos:
// - Desarrollo: http://localhost:8080
// - Producción: https://roadwarningsnarino-backend.onrender.com
export const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") ||
  "http://localhost:8080";
