import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
  ],
  server: {
    // In dev, /api/* is forwarded to the Express backend (no CORS needed).
    proxy: {
      "/api": "http://localhost:3000",
    },
  },
});
