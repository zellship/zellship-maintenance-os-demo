import { describe, expect, it } from "vitest";
import {
  acceptServiceRequest,
  canAcceptServiceRequest,
  canApproveExecution,
  canRejectExecution,
  canReopenExecution,
  isConsumptionDeviation,
  isFormValid,
} from "./domain";
import type { FormField, MaterialAllocation, ServiceRequest } from "./types";

describe("isConsumptionDeviation", () => {
  it("accepts an exact consumption when it matches the configured quantity", () => {
    const allocation: MaterialAllocation = {
      inventoryItemId: "oil",
      mode: "Exact",
      quantity: 2,
      reservedQuantity: 2,
      actualQuantity: 2,
    };

    expect(isConsumptionDeviation(allocation)).toBe(false);
  });

  it("flags values outside a configured range", () => {
    const allocation: MaterialAllocation = {
      inventoryItemId: "coolant",
      mode: "Range",
      min: 3,
      max: 5,
      reservedQuantity: 4,
      actualQuantity: 6,
    };

    expect(isConsumptionDeviation(allocation)).toBe(true);
  });
});

describe("isFormValid", () => {
  const fields: FormField[] = [
    { id: "temperature", type: "number", label: "Temperatura", required: true },
    { id: "comment", type: "comment", label: "Comentario" },
  ];

  it("requires values only for required fields", () => {
    expect(isFormValid(fields, { temperature: 82 })).toBe(true);
    expect(isFormValid(fields, { temperature: "" })).toBe(false);
  });
});

describe("service request acceptance", () => {
  const request: ServiceRequest = {
    id: "request-1",
    externalReference: "SR-1",
    title: "Corrective service",
    description: "Demo",
    source: "External",
    assetId: "asset-1",
    siteLabel: "Site 1",
    region: "North",
    receivedAt: "2026-08-13T10:00:00-06:00",
    acceptanceDueAt: "2026-08-14T10:00:00-06:00",
    acceptancePolicy: { durationHours: 24, expiresTo: "Expired" },
    requiresAcceptance: true,
    status: "Received",
    classification: {
      serviceType: "Corrective",
      installationClass: "Remote",
      accessContext: "Commerce",
    },
    accessRequirements: [],
    protocolId: "protocol-1",
  };

  it("accepts a corrective only inside its acceptance window", () => {
    const acceptedAt = "2026-08-14T09:30:00-06:00";
    expect(canAcceptServiceRequest(request, acceptedAt)).toBe(true);
    expect(
      acceptServiceRequest(request, request.classification, "Coordinator", acceptedAt),
    ).toMatchObject({
      status: "Accepted",
      acceptedBy: "Coordinator",
      acceptedAt,
    });
    expect(canAcceptServiceRequest(request, "2026-08-14T10:00:01-06:00")).toBe(false);
  });

  it("does not apply acceptance to preventive requests", () => {
    expect(
      canAcceptServiceRequest(
        { ...request, requiresAcceptance: false, acceptanceDueAt: undefined },
        "2026-08-14T09:30:00-06:00",
      ),
    ).toBe(false);
  });
});

describe("validation authority", () => {
  it("preserves the frozen supervisor and coordinator boundary", () => {
    expect(canApproveExecution("supervisor")).toBe(true);
    expect(canRejectExecution("supervisor")).toBe(true);
    expect(canReopenExecution("supervisor")).toBe(true);
    expect(canApproveExecution("admin")).toBe(true);
    expect(canRejectExecution("admin")).toBe(false);
    expect(canReopenExecution("admin")).toBe(true);
    expect(canApproveExecution("operator")).toBe(false);
  });
});
