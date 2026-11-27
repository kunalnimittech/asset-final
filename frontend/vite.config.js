import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read .env / .env.[mode] (and the real environment). BACKEND_URL has no VITE_
  // prefix on purpose: it is only used here and in api/proxy.js, never shipped to
  // the browser bundle.
  const env = loadEnv(mode, process.cwd(), "");
  const backend = (env.BACKEND_URL || "http://localhost:3000").replace(/\/+$/, "");

  return {
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
        "/api": backend,
      },
    },
  };
});
