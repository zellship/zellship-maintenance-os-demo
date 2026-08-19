import type {
  StoreAssignment,
  StoreAssignmentSubmission,
  SupportCase,
  SupportIntervention,
  SupportPriority,
} from "./types";

type CaseTransition = {
  supportCase: SupportCase;
  intervention?: SupportIntervention;
};

export function completeStoreAssignment(
  assignment: StoreAssignment,
  submission: StoreAssignmentSubmission,
): StoreAssignment {
  if (!submission.evidenceLabels.includes("Foto de recepción")) {
    throw new Error("A receiving submission requires a photo");
  }
  if (!submission.signatureCaptured) {
    throw new Error("A receiving submission requires a signature");
  }
  return {
    ...assignment,
    status: assignment.requiresValidation ? "Submitted" : "Completed",
    progress: 100,
    completedAt: submission.submittedAt,
    submission,
  };
}

export function createStoreAssignments(input: {
  existing: StoreAssignment[];
  protocolId: string;
  stores: string[];
  responsible: string;
  dueAt: string;
  requiresValidation: boolean;
  comments?: string;
}): StoreAssignment[] {
  const baseNumber = Math.max(
    1027,
    ...input.existing.map((item) => Number(item.id.split("-").at(-1)) || 0),
  );
  return input.stores.map((storeLabel, index) => ({
    id: `RTL-ASG-${baseNumber + index + 1}`,
    protocolId: input.protocolId,
    storeId: storeLabel.toLowerCase().replaceAll(" ", "-"),
    storeLabel,
    responsible: input.responsible,
    dueAt: input.dueAt,
    status: "Assigned",
    protocolVersion: "1.0",
    progress: 0,
    requiresValidation: input.requiresValidation,
    comments: input.comments,
  }));
}

export function supportPriorityForImpact(
  impact: "critical" | "partial" | "minor",
): SupportPriority {
  return impact === "critical" ? "P1" : impact === "partial" ? "P2" : "P3";
}

export function createDirectSupportCase(input: {
  existing: SupportCase[];
  storeLabel: string;
  actor: string;
  category: string;
  symptom: string;
  impact: "critical" | "partial" | "minor";
  reportedAt: string;
  acknowledgementDueAt: string;
  resolutionTargetAt: string;
  assetId?: string;
  sourceAssignment?: StoreAssignment;
  photoIncluded: boolean;
}): SupportCase {
  const baseNumber = Math.max(
    2048,
    ...input.existing.map((item) => Number(item.id.split("-").at(-1)) || 0),
  );
  const id = `RTL-SUP-${baseNumber + 1}`;
  return {
    id,
    title: `${input.category}: ${input.symptom.trim().slice(0, 72)}`,
    storeId: input.storeLabel.toLowerCase().replaceAll(" ", "-"),
    storeLabel: input.storeLabel,
    areaLabel: input.category,
    assetId: input.assetId,
    sourceAssignmentId: input.sourceAssignment?.id,
    sourceProtocolId: input.sourceAssignment?.protocolId,
    symptom: input.symptom.trim(),
    operationalImpact:
      input.impact === "critical"
        ? "La tienda no puede continuar una operación crítica."
        : input.impact === "partial"
          ? "La tienda continúa operando con afectación parcial."
          : "La operación continúa; se requiere seguimiento preventivo.",
    suggestedPriority: supportPriorityForImpact(input.impact),
    status: "Reported",
    route: "Unassigned",
    currentOwner: "Centro de soporte",
    reportedAt: input.reportedAt,
    acknowledgementDueAt: input.acknowledgementDueAt,
    resolutionTargetAt: input.resolutionTargetAt,
    updates: [
      {
        id: `${id}-1`,
        at: input.reportedAt,
        actor: input.actor,
        label: "Solicitud directa desde tienda",
        detail: `${input.photoIncluded ? "Foto demostrativa incluida. " : ""}${input.sourceAssignment ? `Vinculada a ${input.sourceAssignment.id}.` : "Creada fuera de un protocolo."}`,
      },
    ],
  };
}

function requireStatus(supportCase: SupportCase, allowed: SupportCase["status"][]) {
  if (!allowed.includes(supportCase.status)) {
    throw new Error(`Case ${supportCase.id} cannot transition from ${supportCase.status}`);
  }
}

function appendUpdate(
  supportCase: SupportCase,
  at: string,
  actor: string,
  label: string,
  detail: string,
) {
  return {
    ...supportCase,
    updates: [
      ...supportCase.updates,
      { id: `${supportCase.id}-${supportCase.updates.length + 1}`, at, actor, label, detail },
    ],
  };
}

export function reportSupportCase(
  supportCase: SupportCase,
  at: string,
  actor: string,
): SupportCase {
  requireStatus(supportCase, ["Draft", "Reopened"]);
  const reported = appendUpdate(
    supportCase,
    at,
    actor,
    "Solicitud enviada a soporte",
    "La desviación y su evidencia quedaron vinculadas al protocolo de origen.",
  );
  return {
    ...reported,
    status: "Reported",
    reportedAt: at,
    currentOwner: "Centro de soporte",
  };
}

export function assignDiagnosticProtocol(
  supportCase: SupportCase,
  at: string,
  actor: string,
  protocolId: string,
): SupportCase {
  requireStatus(supportCase, ["Reported"]);
  const assigned = appendUpdate(
    supportCase,
    at,
    actor,
    "Diagnóstico remoto asignado",
    "La tienda puede ejecutar verificaciones seguras guiadas antes de escalar.",
  );
  return {
    ...assigned,
    status: "DiagnosticProtocolAssigned",
    route: "Internal",
    confirmedPriority: supportCase.confirmedPriority ?? supportCase.suggestedPriority,
    diagnosticProtocolId: protocolId,
    currentOwner: supportCase.storeLabel,
    acknowledgementDueAt: supportCase.acknowledgementDueAt ?? at,
  };
}

export function startDiagnostic(supportCase: SupportCase, at: string, actor: string): SupportCase {
  requireStatus(supportCase, ["DiagnosticProtocolAssigned"]);
  const started = appendUpdate(
    supportCase,
    at,
    actor,
    "Diagnóstico iniciado",
    "La persona responsable confirmó las reglas de seguridad del protocolo.",
  );
  return { ...started, status: "Diagnosing", currentOwner: actor };
}

export function requestEscalation(
  supportCase: SupportCase,
  at: string,
  actor: string,
): SupportCase {
  requireStatus(supportCase, ["DiagnosticProtocolAssigned", "Diagnosing"]);
  const escalated = appendUpdate(
    supportCase,
    at,
    actor,
    "Intervención requerida",
    "Las verificaciones seguras no restablecieron el servicio; no se realizaron maniobras técnicas.",
  );
  return { ...escalated, status: "EscalationRequired", currentOwner: "Centro de soporte" };
}

export function assignExternalIntervention(
  supportCase: SupportCase,
  at: string,
  actor: string,
  scheduledAt: string,
): CaseTransition {
  requireStatus(supportCase, ["EscalationRequired"]);
  const intervention: SupportIntervention = {
    id: `${supportCase.id}-EXT-1`,
    caseId: supportCase.id,
    route: "External",
    assignee: "Clima Servicio Demo",
    specialty: "Climatización comercial",
    scheduledAt,
    status: "Scheduled",
  };
  const assigned = appendUpdate(
    supportCase,
    at,
    actor,
    "Proveedor especializado asignado",
    "La visita quedó programada y la tienda recibió la ventana estimada.",
  );
  return {
    supportCase: {
      ...assigned,
      status: "ExternalAssigned",
      route: "External",
      currentOwner: intervention.assignee,
      interventionId: intervention.id,
      resolutionTargetAt: scheduledAt,
    },
    intervention,
  };
}

export function recordSupportResolution(
  supportCase: SupportCase,
  intervention: SupportIntervention,
  at: string,
  actor: string,
): CaseTransition {
  requireStatus(supportCase, ["ExternalAssigned", "InService", "InternalAssigned"]);
  const resolution =
    "Se corrigió el control de la unidad, se estabilizó el flujo y se verificó la temperatura.";
  const resolved = appendUpdate(
    supportCase,
    at,
    actor,
    "Intervención concluida",
    "Soporte solicita a la tienda confirmar que la operación fue restablecida.",
  );
  return {
    supportCase: {
      ...resolved,
      status: "PendingStoreConfirmation",
      currentOwner: supportCase.storeLabel,
      resolutionSummary: resolution,
    },
    intervention: {
      ...intervention,
      status: "Resolved",
      resolution,
      evidenceLabel: "Lectura final y evidencia de servicio",
    },
  };
}

export function confirmStoreResolution(
  supportCase: SupportCase,
  at: string,
  actor: string,
): SupportCase {
  requireStatus(supportCase, ["PendingStoreConfirmation"]);
  const confirmed = appendUpdate(
    supportCase,
    at,
    actor,
    "Operación confirmada por tienda",
    "La temperatura y el flujo se mantienen dentro de la condición esperada.",
  );
  return {
    ...confirmed,
    status: "PendingSupportValidation",
    currentOwner: "Centro de soporte",
    storeConfirmedAt: at,
  };
}

export function closeSupportCase(supportCase: SupportCase, at: string, actor: string): SupportCase {
  requireStatus(supportCase, ["PendingSupportValidation"]);
  if (!supportCase.storeConfirmedAt) {
    throw new Error(`Case ${supportCase.id} requires store confirmation before closure`);
  }
  const closed = appendUpdate(
    supportCase,
    at,
    actor,
    "Solicitud cerrada",
    "Soporte validó evidencia, confirmación de tienda y trazabilidad completa.",
  );
  return { ...closed, status: "Closed", currentOwner: "Centro de soporte", closedAt: at };
}
