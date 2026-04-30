import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      manifest: {
        name: "Connect 4",
        short_name: "Connect 4",
        description: "Offline Connect 4 against AI opponents at four difficulty levels.",
        categories: ["games"],
        theme_color: "#f8fafc",
        background_color: "#f8fafc",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/pwa-icon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any"
          }
          // TODO(seo): add a separate maskable PNG icon (192x192 and 512x512) with the
          // required ~80% safe zone. The current SVG has no safe zone, so it should not
          // be advertised as `purpose: "maskable"` — Android would clip the corners.
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,ico,png,webmanifest,wasm}"],
        // Without this, the SW's default navigateFallback to /index.html intercepts
        // address-bar navigations to /sitemap.xml and /robots.txt and serves the SPA
        // shell instead. Crawlers don't execute SWs so SEO is unaffected, but this
        // makes the URLs verifiable in a normal browser tab.
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts"
  }
});
