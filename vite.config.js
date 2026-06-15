import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/travel-api": {
        target: "https://travelriskapi.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/travel-api/, "/api/v1"),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ["recharts"],
          globe: ["three"]
        }
      }
    }
  }
});
