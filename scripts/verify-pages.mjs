import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const routes = [
  {
    name: "ATM",
    htmlPath: "dist-pages/index.html",
    base: "/zellship-maintenance-os-demo/",
    artifactRoot: "dist-pages",
  },
  {
    name: "ATM autorizado RC4",
    htmlPath: "dist-pages/atm/index.html",
    base: "/zellship-maintenance-os-demo/atm/",
    artifactRoot: "dist-pages/atm",
  },
  {
    name: "Planta de Alambres",
    htmlPath: "dist-pages/wire/index.html",
    base: "/zellship-maintenance-os-demo/wire/",
    artifactRoot: "dist-pages/wire",
  },
  {
    name: "Retail Store Operations",
    htmlPath: "dist-pages/retail/index.html",
    base: "/zellship-maintenance-os-demo/retail/",
    artifactRoot: "dist-pages/retail",
  },
];

for (const route of routes) {
  const htmlFile = resolve(route.htmlPath);
  if (!existsSync(htmlFile)) throw new Error(`${route.name}: missing ${route.htmlPath}`);

  const html = readFileSync(htmlFile, "utf8");
  const scriptSrc = html.match(/<script[^>]+src="([^"]+\.js)"/)?.[1];
  if (!scriptSrc?.startsWith(`${route.base}assets/`)) {
    throw new Error(`${route.name}: JavaScript asset does not use ${route.base}`);
  }

  const routeArtifactPath = resolve(route.artifactRoot, scriptSrc.replace(route.base, ""));
  if (!existsSync(routeArtifactPath)) {
    throw new Error(`${route.name}: missing compiled asset ${routeArtifactPath}`);
  }

  console.log(`${route.name}: ${route.htmlPath} and ${scriptSrc} verified`);

  if (route.name === "ATM autorizado RC4") {
    const bundle = readFileSync(routeArtifactPath, "utf8");
    for (const marker of ["Reiniciar móvil", "Contexto móvil reiniciado"]) {
      if (!bundle.includes(marker)) {
        throw new Error(`${route.name}: missing mobile reset marker: ${marker}`);
      }
    }
  }
}
