import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import { createReadStream, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, extname, join } from "node:path";
import { fileURLToPath, URL } from "node:url";

// Archivos del intérprete que carga el worker de Python (ADR-006)
const PYODIDE_FILES = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "python_stdlib.zip",
  "pyodide-lock.json",
];
const CONTENT_TYPES: Record<string, string> = {
  ".mjs": "text/javascript",
  ".wasm": "application/wasm",
  ".zip": "application/zip",
  ".json": "application/json",
};

// Sirve Pyodide desde el propio juego, sin CDN. Vite no deja importar módulos de public/
// en desarrollo, así que en dev se leen de node_modules y en el build se copian a dist/pyodide.
function pyodideAssets(): Plugin {
  const source = dirname(createRequire(import.meta.url).resolve("pyodide/package.json"));
  return {
    name: "hacklab-pyodide",
    configureServer(server) {
      server.middlewares.use(server.config.base + "pyodide", (req, res, next) => {
        const file = (req.url ?? "").split("?")[0]?.replace(/^\//, "") ?? "";
        if (!PYODIDE_FILES.includes(file)) return next();
        res.setHeader("Content-Type", CONTENT_TYPES[extname(file)] ?? "application/octet-stream");
        createReadStream(join(source, file)).pipe(res);
      });
    },
    generateBundle() {
      for (const file of PYODIDE_FILES) {
        this.emitFile({
          type: "asset",
          fileName: "pyodide/" + file,
          source: readFileSync(join(source, file)),
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), pyodideAssets()],
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
