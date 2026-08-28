import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    // Bind mounts on Docker Desktop (Windows/macOS) don't deliver inotify
    // events, so file watching must poll for hot-reload to work.
    watch: { usePolling: true, interval: 300 },
  },
});
