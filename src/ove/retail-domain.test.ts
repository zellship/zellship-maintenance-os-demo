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
