import { Tag } from "antd";

export function statusTag(s: string) {
  const map: Record<string, { color: string; label: string }> = {
    Pending: { color: "default", label: "Pendiente" },
    InProgress: { color: "processing", label: "En ejecución" },
    Completed: { color: "success", label: "Completado" },
    Expired: { color: "error", label: "Incidencia" },
    Cancelled: { color: "default", label: "Cancelado" },
    Validated: { color: "success", label: "Validado" },
    PendingValidation: { color: "warning", label: "Pendiente validación" },
    Rejected: { color: "error", label: "Rechazado" },
    Draft: { color: "default", label: "Borrador" },
    Active: { color: "green", label: "Activo" },
    Inactive: { color: "default", label: "Inactivo" },
    Archived: { color: "default", label: "Archivado" },
    Open: { color: "red", label: "Abierta" },
    Review: { color: "orange", label: "Revisión" },
    Resolved: { color: "green", label: "Resuelta" },
    Closed: { color: "default", label: "Cerrada" },
    Valid: { color: "green", label: "Válida" },
    Invalid: { color: "red", label: "Inválida" },
  };
  const v = map[s] ?? { color: "default", label: s };
  return <Tag color={v.color}>{v.label}</Tag>;
}

export function priorityTag(p: string) {
  const map: Record<string, string> = { Low: "blue", Medium: "gold", High: "orange", Critical: "red" };
  return <Tag color={map[p] ?? "default"}>{p}</Tag>;
}