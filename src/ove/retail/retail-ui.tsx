import { Tag } from "antd";
import type { StoreAssignmentStatus, SupportCaseStatus, SupportPriority } from "../types";

const caseStatusLabels: Record<SupportCaseStatus, string> = {
  Draft: "Borrador en tienda",
  Reported: "Recibida",
  DiagnosticProtocolAssigned: "Diagnóstico asignado",
  Diagnosing: "En diagnóstico",
  EscalationRequired: "Requiere intervención",
  InternalAssigned: "Soporte interno asignado",
  ExternalAssigned: "Proveedor asignado",
  InService: "En atención",
  PendingStoreConfirmation: "Confirmación de tienda",
  PendingSupportValidation: "Validación de soporte",
  Closed: "Cerrada",
  Reopened: "Reabierta",
};

const assignmentLabels: Record<StoreAssignmentStatus, string> = {
  Draft: "Borrador",
  Assigned: "Publicada",
  Acknowledged: "Recibida",
  InProgress: "En ejecución",
  Submitted: "Enviada",
  Returned: "Devuelta",
  Validated: "Validada",
  Completed: "Completada",
};

export function SupportStatusTag({ status }: { status: SupportCaseStatus }) {
  const color =
    status === "Closed"
      ? "green"
      : status === "EscalationRequired"
        ? "red"
        : status === "ExternalAssigned" || status === "PendingStoreConfirmation"
          ? "orange"
          : status === "PendingSupportValidation"
            ? "purple"
            : "blue";
  return <Tag color={color}>{caseStatusLabels[status]}</Tag>;
}

export function AssignmentStatusTag({ status }: { status: StoreAssignmentStatus }) {
  const color =
    status === "Completed" || status === "Validated"
      ? "green"
      : status === "InProgress"
        ? "processing"
        : status === "Draft"
          ? "default"
          : "purple";
  return <Tag color={color}>{assignmentLabels[status]}</Tag>;
}

export function PriorityTag({ priority }: { priority: SupportPriority }) {
  const color = priority === "P1" ? "red" : priority === "P2" ? "orange" : "gold";
  return <Tag color={color}>{priority}</Tag>;
}
