import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

// PORT is only required for the dev/preview server, not for production builds.
const rawPort = process.env.PORT;
let port: number | undefined;
if (rawPort) {
  port = Number(rawPort);
  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }
}

// GitHub Pages project site — served under /<repo-name>/.
// Defaults to /Pitch_Perfect/ (inferred from remote origin
// git@github.com:rujankhiuju/Pitch_Perfect.git).  Override via
// BASE_PATH env var when needed (e.g. local dev with base: '/').
const basePath = process.env.BASE_PATH || '/Pitch-Perfect/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  ...(port
    ? {
        server: {
          port,
          strictPort: true,
          host: "0.0.0.0",
          allowedHosts: true,
          fs: {
            strict: true,
          },
        },
        preview: {
          port,
          host: "0.0.0.0",
          allowedHosts: true,
        },
      }
    : {}),
});
