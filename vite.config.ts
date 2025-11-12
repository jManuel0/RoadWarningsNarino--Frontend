import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
const VITE_API_URL= //https://roadwarningsnarino-backend.onrender.com/



export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
