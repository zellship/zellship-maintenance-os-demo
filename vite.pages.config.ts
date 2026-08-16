import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const pagesBase = process.env.VITE_PAGES_BASE ?? "/zellship-maintenance-os-demo/";
const pagesOutDir = process.env.VITE_PAGES_OUT_DIR ?? "../dist-pages";

export default defineConfig({
  root: "pages-entry",
  base: pagesBase,
  publicDir: "../public",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: pagesOutDir,
    emptyOutDir: true,
  },
});
