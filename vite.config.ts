import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    // Deploy estático (GitHub Pages o Vercel)
    outDir: "dist",
    sourcemap: true,
    // Three.js minificado ronda 900 kB y no se puede partir más. Las escenas ya se
    // cargan en diferido (React.lazy en App.tsx), así que el límite de 500 kB no aplica.
    chunkSizeWarningLimit: 1000,
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}", "src/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/index.ts", "src/main.tsx"],
    },
  },
});
