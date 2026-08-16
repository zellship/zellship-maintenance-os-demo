import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const routes = [
  {
    name: "ATM",
    htmlPath: "dist-pages/index.html",
    base: "/zellship-maintenance-os-demo/",
  },
  {
    name: "Planta de Alambres",
    htmlPath: "dist-pages/wire/index.html",
    base: "/zellship-maintenance-os-demo/wire/",
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

  const artifactPath = resolve("dist-pages", scriptSrc.replace(route.base, ""));
  const routeArtifactPath =
    route.name === "ATM"
      ? artifactPath
      : resolve("dist-pages/wire", scriptSrc.replace(route.base, ""));
  if (!existsSync(routeArtifactPath)) {
    throw new Error(`${route.name}: missing compiled asset ${routeArtifactPath}`);
  }

  console.log(`${route.name}: ${route.htmlPath} and ${scriptSrc} verified`);
}
