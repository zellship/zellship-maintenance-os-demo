import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const pagesBase = process.env.VITE_PAGES_BASE ?? "/zellship-maintenance-os-demo/";
const pagesOutDir = process.env.VITE_PAGES_OUT_DIR ?? "../dist-pages";
const buildOee = process.env.VITE_BUILD_OEE === "true";
const fromConfig = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  root: "pages-entry",
  base: pagesBase,
  publicDir: buildOee ? false : "../public",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: pagesOutDir,
    emptyOutDir: true,
    rollupOptions: buildOee
      ? {
          input: {
            oee: fromConfig("./pages-entry/oee/index.html"),
            presentation: fromConfig("./pages-entry/oee/presentacion/index.html"),
            demo: fromConfig("./pages-entry/oee/demo/index.html"),
            proposal: fromConfig("./pages-entry/oee/propuesta/index.html"),
          },
        }
      : undefined,
  },
});
