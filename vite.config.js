import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { Agent } from "http";

// keepAlive disabled so the proxy never reuses a socket between
// requests — eliminates any chance of a stale/hung connection
// affecting a later request in the same browser session.
const freshAgent = new Agent({ keepAlive: false });

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        timeout: 300000,
        proxyTimeout: 300000,
        agent: freshAgent,
      },
    },
  },
});
