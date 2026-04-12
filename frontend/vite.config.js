import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 9000,
    proxy: {
      "/auth": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/expenses": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/summary": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
      "/report": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
