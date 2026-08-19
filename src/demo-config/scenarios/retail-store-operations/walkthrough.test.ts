import { describe, expect, it } from "vitest";
import { retailStoreOperationsScenario } from "./config";

describe("retail store operations walkthrough", () => {
  const data = retailStoreOperationsScenario.data;

  it("covers the store-to-support executive narrative", () => {
    const opening = data.protocols.find((item) => item.id === "retail-opening");
    const diagnostic = data.protocols.find((item) => item.id === "retail-hvac-diagnostic");
    const assignment = data.storeAssignments?.find((item) => item.id === "RTL-ASG-1024");
    const supportCase = data.supportCases?.find((item) => item.id === "RTL-SUP-2048");

    expect(opening?.category).toBe("Apertura y presentación");
    expect(diagnostic?.activationMode).toBe("Triggered");
    expect(diagnostic?.safetyInstructions?.join(" ")).toContain("No abrir gabinetes");
    expect(assignment).toMatchObject({ storeLabel: "Boutique Norte", status: "Acknowledged" });
    expect(supportCase).toMatchObject({
      status: "Draft",
      sourceAssignmentId: assignment?.id,
      sourceProtocolId: opening?.id,
      route: "Unassigned",
    });
  });

  it("contains both internal and external support context", () => {
    expect(data.supportCases?.some((item) => item.route === "Internal")).toBe(true);
    expect(data.supportCases?.some((item) => item.route === "External")).toBe(true);
    expect(data.supportInterventions?.some((item) => item.route === "External")).toBe(true);
  });

  it("includes a mobile merchandise receiving assignment with traceable evidence", () => {
    const receipt = data.protocols.find((item) => item.id === "retail-merchandise-receipt");
    const assignment = data.storeAssignments?.find((item) => item.id === "RTL-ASG-1028");
    const notification = data.notifications.find((item) => item.id === "not-retail-receipt");

    expect(receipt?.evidenceConfig.map((item) => item.type)).toEqual([
      "Photo",
      "Timestamp",
      "Signature",
    ]);
    expect(assignment).toMatchObject({
      protocolId: receipt?.id,
      storeLabel: "Boutique Norte",
      responsible: "Valeria Santos",
      status: "Assigned",
    });
    expect(notification).toMatchObject({
      recipient: "Valeria Santos",
      actionLabel: "Atender recepción",
      status: "Sent",
    });
  });

  it("keeps the cleaning protocol intentionally lightweight", () => {
    const cleaning = data.protocols.find((item) => item.id === "retail-cleaning");
    const assignment = data.storeAssignments?.find((item) => item.id === "RTL-ASG-1029");

    expect(cleaning?.evidenceConfig).toMatchObject([
      { type: "Photo", required: true, humanRating: true },
    ]);
    expect(cleaning?.formConfig.map((item) => item.id)).toEqual(["selfRating", "comments"]);
    expect(cleaning?.materialRequirements).toHaveLength(2);
    expect(assignment).toMatchObject({
      protocolId: "retail-cleaning",
      storeLabel: "Boutique Norte",
      status: "Assigned",
    });
  });

  it("uses neutral fictitious data in the public artifact", () => {
    expect(JSON.stringify(data)).not.toMatch(/Harris|Frank/i);
    expect(retailStoreOperationsScenario.distribution.classification).toBe("public-demo");
    expect(retailStoreOperationsScenario.distribution.containsClientIdentifiableData).toBe(false);
  });
});
