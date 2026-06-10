import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api-wilayah": {
        target: "https://kanglerian.github.io/api-wilayah-indonesia/api",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-wilayah/, ""),
      },
      "/api-prayer": {
        target: "https://masjidku-api.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-prayer/, ""),
      },
    },
  },
});
