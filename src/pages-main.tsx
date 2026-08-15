import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./ove/AppShell";
import "./styles.css";
import { activeDemo } from "./demo-config/active";

export function mountApp() {
  document.title = `${activeDemo.branding.productName} · ${activeDemo.label}`;
  setMeta("description", activeDemo.branding.metaDescription);
  setMeta("og:title", activeDemo.branding.productName, "property");
  setMeta("og:description", activeDemo.branding.socialDescription, "property");
  setMeta("twitter:title", activeDemo.branding.productName);
  setMeta("twitter:description", activeDemo.branding.socialDescription);
  const root = document.getElementById("root");

  if (!root) {
    throw new Error("No se encontró el contenedor principal de la aplicación.");
  }

  createRoot(root).render(
    <StrictMode>
      <AppShell />
    </StrictMode>,
  );
}

function setMeta(name: string, content: string, attribute: "name" | "property" = "name") {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
    ?.setAttribute("content", content);
}
