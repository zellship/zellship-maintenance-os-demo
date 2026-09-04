import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { OeeHubApp } from "./oee/OeeHubApp";
import "./oee/oee-hub.css";

export function mountOeeHub() {
  const root = document.getElementById("root");

  if (!root) throw new Error("No se encontró el contenedor del OEE Experience Hub.");

  createRoot(root).render(
    <StrictMode>
      <OeeHubApp />
    </StrictMode>,
  );
}
