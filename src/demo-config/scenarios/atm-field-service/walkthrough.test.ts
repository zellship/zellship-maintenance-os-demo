import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { capabilityProfiles } from "../../capabilities";
import {
  canApproveExecution,
  canRejectExecution,
  canReopenExecution,
  resolveValidationExecutionId,
} from "../../../ove/domain";
import { atmFieldServiceScenario } from "./config";

const scenario = atmFieldServiceScenario;
const primaryRequest = scenario.data.serviceRequests.find(
  (request) => request.externalReference === "SO-ATM-2401",
)!;
const primaryProtocol = scenario.data.protocols.find(
  (protocol) => protocol.id === primaryRequest.protocolId,
)!;

describe("MNT-DEMO-ATM-003E eight-scene walkthrough contract", () => {
  it("scene 1 starts with an urgent corrective and an exact 24-hour acceptance window", () => {
    expect(primaryRequest).toMatchObject({
      status: "Received",
      requiresAcceptance: true,
      acceptancePolicy: { durationHours: 24 },
    });
    expect(dayjs(primaryRequest.acceptanceDueAt).diff(primaryRequest.receivedAt, "hour")).toBe(24);
    expect(
      dayjs(primaryRequest.acceptanceDueAt).diff(
        dayjs(primaryRequest.receivedAt).add(20, "hour"),
        "hour",
      ),
    ).toBe(4);
  });

  it("scene 2 keeps service, installation, and access context as separate values", () => {
    expect(primaryRequest.classification).toEqual({
      serviceType: "Correctivo",
      installationClass: "REMOTO",
      accessContext: "Comercio",
    });
    expect(primaryProtocol.name).toContain("Comercio");
    expect(primaryProtocol.assetIds).toContain(primaryRequest.assetId);
  });

  it("scene 3 has eligible resources, access readiness, and preventive context", () => {
    const primaryOperator = scenario.data.people.find(
      (person) => person.name === scenario.context.primaryOperator,
    )!;
    const preventive = scenario.data.serviceRequests.find(
      (request) => request.classification.serviceType === "Preventivo",
    );

    expect(
      primaryProtocol.requiredSkillIds?.every((skillId) =>
        primaryOperator.skillIds.includes(skillId),
      ),
    ).toBe(true);
    expect(primaryProtocol.requiredToolIds?.length).toBeGreaterThan(0);
    expect(primaryProtocol.materialRequirements?.length).toBeGreaterThan(0);
    expect(primaryRequest.accessRequirements.some((item) => item.id === "identification")).toBe(
      true,
    );
    expect(preventive).toMatchObject({ status: "Planned", requiresAcceptance: false });
  });

  it("scene 4 requires a simulated location record before field execution", () => {
    expect(primaryProtocol.evidenceConfig).toContainEqual(
      expect.objectContaining({ type: "GPS", required: true }),
    );
    expect(scenario.context.primaryOperator).toBe("Luis Campos");
  });

  it("scene 5 has a guided photo manifest owned by the ATM scenario", () => {
    const photos = primaryProtocol.evidenceConfig.filter(
      (evidence) => evidence.type === "Photo" && evidence.required,
    );
    expect(photos).toHaveLength(3);
    expect(photos.map((photo) => photo.phase)).toEqual([
      "Pre-intervention",
      "Intervention",
      "Post-intervention",
    ]);
    expect(photos.every((photo) => photo.label && photo.captureData?.endsWith(".jpg"))).toBe(true);
    expect(scenario.context.evidenceAssets.subjectLabel).toBe("ATM-014");
    expect(scenario.context.evidenceAssets.referencePath).toContain("atm-reference");
  });

  it("preloads three executable assignments for the primary mobile operator", () => {
    const pendingAssignments = scenario.data.schedules.filter(
      (schedule) =>
        schedule.operator === scenario.context.primaryOperator && schedule.status === "Pending",
    );

    expect(pendingAssignments).toHaveLength(3);
    expect(
      new Set(pendingAssignments.map((schedule) => schedule.classification?.accessContext)),
    ).toEqual(new Set(["Comercio", "Banco", "Torre residencial"]));
  });

  it("scene 6 records concepts and quantities without a price field", () => {
    expect(primaryProtocol.workConceptTemplates?.length).toBeGreaterThan(0);
    for (const concept of primaryProtocol.workConceptTemplates ?? []) {
      expect(concept).toEqual(
        expect.objectContaining({ code: expect.any(String), quantity: expect.any(Number) }),
      );
      expect(Object.keys(concept)).not.toContain("price");
      expect(Object.keys(concept)).not.toContain("amount");
    }
  });

  it("scene 7 preserves the frozen authority and revision boundaries", () => {
    expect(canApproveExecution("supervisor")).toBe(true);
    expect(canRejectExecution("supervisor")).toBe(true);
    expect(canReopenExecution("supervisor")).toBe(true);
    expect(canApproveExecution("admin")).toBe(true);
    expect(canRejectExecution("admin")).toBe(false);
    expect(canReopenExecution("admin")).toBe(true);
    expect(
      scenario.data.executions.some(
        (execution) => execution.status === "PendingValidation" && execution.revision === 1,
      ),
    ).toBe(true);
  });

  it("routes a validation-required event to its pending execution", () => {
    const event = scenario.data.notifications.find(
      (notification) => notification.type === "ValidationRequired",
    )!;

    expect(
      resolveValidationExecutionId(event, scenario.data.schedules, scenario.data.executions),
    ).toBe("e-atm-review");
  });

  it("scene 8 has a validated revision and excludes Improvement and Executive", () => {
    const validated = scenario.data.executions.find(
      (execution) => execution.status === "Validated" && execution.revision === 2,
    );

    expect(validated?.workConcepts?.length).toBeGreaterThan(0);
    const reportPhotos = validated?.evidences.filter((evidence) => evidence.type === "Photo") ?? [];
    expect(reportPhotos).toHaveLength(3);
    expect(reportPhotos.every((photo) => Boolean(photo.gps && photo.label))).toBe(true);
    expect(scenario.capabilities).toEqual(capabilityProfiles["execution-only"]);
    expect(scenario.capabilities).not.toContain("improvement-insights");
    expect(scenario.capabilities).not.toContain("executive-analytics");
  });
});
