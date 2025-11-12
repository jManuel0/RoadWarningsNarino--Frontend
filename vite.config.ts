// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  // Carga variables de entorno (incluye VITE_* desde archivos .env)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Proxy solo en desarrollo para evitar CORS:
    server: env.VITE_API_URL
      ? {
          proxy: {
            // Si tu backend expone /api/... (ej. /api/auth, /api/alert)
            "/api": {
              target: env.VITE_API_URL,
              changeOrigin: true,
              secure: false,
            },
          },
        }
      : undefined,
  };
});
