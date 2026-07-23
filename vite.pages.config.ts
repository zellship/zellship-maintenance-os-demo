import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  root: "pages-entry",
  base: "/zellship-maintenance-os-demo/",
  publicDir: "../public",
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    outDir: "../dist-pages",
    emptyOutDir: true,
  },
});
