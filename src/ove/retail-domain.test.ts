import { describe, expect, it } from "vitest";
import { seedSupportCases } from "../demo-config/scenarios/retail-store-operations/data";
import {
  assignDiagnosticProtocol,
  assignExternalIntervention,
  closeSupportCase,
  confirmStoreResolution,
  recordSupportResolution,
  reportSupportCase,
  requestEscalation,
  startDiagnostic,
  createStoreAssignments,
  createDirectSupportCase,
  completeStoreAssignment,
} from "./retail-domain";

describe("retail support case lifecycle", () => {
  it("keeps the incident linked to the source protocol through closure", () => {
    const draft = seedSupportCases.find((item) => item.id === "RTL-SUP-2048");
    expect(draft).toBeDefined();
    if (!draft) return;

    const reported = reportSupportCase(draft, "2026-08-19T15:00:00.000Z", "Valeria Santos");
    const assigned = assignDiagnosticProtocol(
      reported,
      "2026-08-19T15:02:00.000Z",
      "Elena Ríos",
      "retail-hvac-diagnostic",
    );
    const diagnosing = startDiagnostic(assigned, "2026-08-19T15:05:00.000Z", "Valeria Santos");
    const escalated = requestEscalation(diagnosing, "2026-08-19T15:12:00.000Z", "Valeria Santos");
    const external = assignExternalIntervention(
      escalated,
      "2026-08-19T15:14:00.000Z",
      "Elena Ríos",
      "2026-08-19T17:00:00.000Z",
    );
    const resolved = recordSupportResolution(
      external.supportCase,
      external.intervention!,
      "2026-08-19T17:45:00.000Z",
      "Clima Servicio Demo",
    );
    const confirmed = confirmStoreResolution(
      resolved.supportCase,
      "2026-08-19T18:00:00.000Z",
      "Valeria Santos",
    );
    const closed = closeSupportCase(confirmed, "2026-08-19T18:04:00.000Z", "Elena Ríos");

    expect(closed.status).toBe("Closed");
    expect(closed.sourceAssignmentId).toBe("RTL-ASG-1024");
    expect(closed.sourceProtocolId).toBe("retail-opening");
    expect(closed.storeConfirmedAt).toBeDefined();
    expect(closed.updates.at(-1)?.label).toBe("Solicitud cerrada");
  });

  it("does not close a case before store confirmation", () => {
    const draft = seedSupportCases[0];
    expect(() => closeSupportCase(draft, "2026-08-19T18:04:00.000Z", "Elena Ríos")).toThrow();
  });
});

describe("retail store initiated work", () => {
  it("completes a receiving assignment with photo, audit data and signature", () => {
    const assignment = createStoreAssignments({
      existing: [],
      protocolId: "retail-merchandise-receipt",
      stores: ["Boutique Norte"],
      responsible: "Valeria Santos",
      dueAt: "2026-08-20T16:00:00.000Z",
      requiresValidation: true,
    })[0];
    const completed = completeStoreAssignment(assignment, {
      submittedAt: "2026-08-20T15:30:00.000Z",
      submittedBy: "Valeria Santos",
      evidenceLabels: ["Foto de recepción", "Fecha y hora"],
      formAnswers: { expectedQuantity: 48, receivedQuantity: 48, damagedQuantity: 0 },
      signatureCaptured: true,
    });

    expect(completed).toMatchObject({ status: "Submitted", progress: 100 });
    expect(completed.submission?.submittedBy).toBe("Valeria Santos");
  });

  it("rejects a receiving submission without its required evidence", () => {
    const assignment = createStoreAssignments({
      existing: [],
      protocolId: "retail-merchandise-receipt",
      stores: ["Boutique Norte"],
      responsible: "Valeria Santos",
      dueAt: "2026-08-20T16:00:00.000Z",
      requiresValidation: false,
    })[0];
    expect(() =>
      completeStoreAssignment(assignment, {
        submittedAt: "2026-08-20T15:30:00.000Z",
        submittedBy: "Valeria Santos",
        evidenceLabels: [],
        formAnswers: {},
        signatureCaptured: false,
      }),
    ).toThrow(/photo/i);
  });

  it("creates independent assignments for every selected store", () => {
    const assignments = createStoreAssignments({
      existing: [],
      protocolId: "retail-cleaning",
      stores: ["Boutique Norte", "Boutique Centro"],
      responsible: "Valeria Santos",
      dueAt: "2026-08-20T16:00:00.000Z",
      requiresValidation: false,
      comments: "Revisar presentación antes de abrir.",
    });

    expect(assignments).toHaveLength(2);
    expect(new Set(assignments.map((item) => item.id)).size).toBe(2);
    expect(assignments.every((item) => item.status === "Assigned")).toBe(true);
    expect(assignments.every((item) => item.comments?.includes("presentación"))).toBe(true);
  });

  it("creates direct store support with optional assignment context", () => {
    const sourceAssignment = createStoreAssignments({
      existing: [],
      protocolId: "retail-opening",
      stores: ["Boutique Norte"],
      responsible: "Valeria Santos",
      dueAt: "2026-08-20T16:00:00.000Z",
      requiresValidation: true,
    })[0];
    const supportCase = createDirectSupportCase({
      existing: [],
      storeLabel: "Boutique Norte",
      actor: "Valeria Santos",
      category: "Punto de venta",
      symptom: "La terminal no permite completar el cobro",
      impact: "critical",
      reportedAt: "2026-08-20T15:00:00.000Z",
      acknowledgementDueAt: "2026-08-20T15:05:00.000Z",
      resolutionTargetAt: "2026-08-20T17:00:00.000Z",
      sourceAssignment,
      photoIncluded: true,
    });

    expect(supportCase).toMatchObject({
      status: "Reported",
      suggestedPriority: "P1",
      sourceAssignmentId: sourceAssignment.id,
      sourceProtocolId: sourceAssignment.protocolId,
      currentOwner: "Centro de soporte",
    });
  });
});
