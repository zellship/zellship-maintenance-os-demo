import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./ove/AppShell";
import "./styles.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("No se encontró el contenedor principal de la aplicación.");
}

createRoot(root).render(
  <StrictMode>
    <AppShell />
  </StrictMode>,
);
