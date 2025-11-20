// vite.config.ts
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { visualizer } from "rollup-plugin-visualizer";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
  // Carga variables de entorno (incluye VITE_* desde archivos .env)
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      react(),
      // Compression plugin para producción
      viteCompression({
        algorithm: "gzip",
        ext: ".gz",
      }),
      viteCompression({
        algorithm: "brotliCompress",
        ext: ".br",
      }),
      // Bundle analyzer (solo en modo analyze)
      mode === "analyze" &&
        visualizer({
          open: true,
          filename: "dist/stats.html",
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    // Optimizaciones de build
    build: {
      // Target modern browsers
      target: "es2020",

      // Optimizaciones
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true, // Elimina console.log en producción
          drop_debugger: true,
        },
      },

      // Chunk splitting strategy
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunks
            react: ["react", "react-dom", "react-router-dom"],
            maps: ["leaflet", "react-leaflet"],
            ui: ["lucide-react", "sonner"],
            charts: ["recharts"],
            state: ["zustand"],
            utils: ["date-fns", "axios"],
          },
        },
      },

      // Chunk size warnings
      chunkSizeWarningLimit: 1000,

      // Source maps solo en desarrollo
      sourcemap: mode === "development",
    },

    // Optimizaciones de dependencies
    optimizeDeps: {
      include: ["react", "react-dom", "react-router-dom"],
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
