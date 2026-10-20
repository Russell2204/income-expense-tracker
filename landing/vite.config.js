import { copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

const landingRoot = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(landingRoot, "..");

export default defineConfig({
  root: landingRoot,
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "copy-tracker",
      closeBundle() {
        const target = path.resolve(projectRoot, "dist/app");
        mkdirSync(target, { recursive: true });
        for (const file of ["index.html", "main.css", "script.js"]) {
          copyFileSync(path.resolve(projectRoot, file), path.resolve(target, file));
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(landingRoot, "src")
    }
  },
  build: {
    outDir: path.resolve(projectRoot, "dist"),
    emptyOutDir: true
  }
});
