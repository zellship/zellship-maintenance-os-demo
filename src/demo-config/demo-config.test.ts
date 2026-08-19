import { describe, expect, it } from "vitest";
import { capabilityProfiles } from "./capabilities";
import { resolveDemoNow } from "./clock";
import { resolveDemoScenario } from "./registry";
import { demoScenarioDescriptorSchema } from "./schema";
import { industrialBaseScenario } from "./scenarios/industrial-base/config";
import { atmFieldServiceScenario } from "./scenarios/atm-field-service/config";
import { wirePlantMaintenanceScenario } from "./scenarios/wire-plant-maintenance/config";
import { retailStoreOperationsScenario } from "./scenarios/retail-store-operations/config";

describe("demo scenario registry", () => {
  it("preserves the audited industrial baseline contract", () => {
    const scenario = resolveDemoScenario("industrial-base");

    expect(scenario.id).toBe("industrial-base");
    expect(scenario.version).toBe("1.2.0");
    expect(scenario.sourceBaseline).toBe("f12b7c85ee7ba20ca9df4168c66f4a9765abcccb");
    expect(scenario.persistence.stateKey).toBe("zellship-maintenance-os-v5");
    expect(scenario.data.assets).toHaveLength(4);
    expect(scenario.data.protocols).toHaveLength(4);
    expect(scenario.data.schedules).toHaveLength(7);
    expect(scenario.data.documents.length).toBeGreaterThan(0);
  });

  it.each([
    industrialBaseScenario,
    atmFieldServiceScenario,
    wirePlantMaintenanceScenario,
    retailStoreOperationsScenario,
  ])("$id separates availability from operational condition", (scenario) => {
    for (const asset of scenario.data.assets) {
      expect(asset.availabilityStatus, asset.id).toBeDefined();
      expect(asset.operationalCondition, asset.id).toBeDefined();
      if (
        asset.operationalCondition === "Quarantine" ||
        asset.operationalCondition === "OutOfService"
      ) {
        expect(asset.availabilityStatus, asset.id).toBe("Unavailable");
      }
      if (asset.estimatedReleaseAt) {
        expect(new Date(asset.estimatedReleaseAt).getTime(), asset.id).toBeGreaterThan(
          resolveDemoNow().valueOf(),
        );
      }
    }

    for (const asset of scenario.data.assets.filter(
      (candidate) => candidate.availabilityStatus === "Assigned",
    )) {
      expect(
        scenario.data.schedules.some(
          (schedule) =>
            schedule.assetId === asset.id &&
            (schedule.status === "Pending" || schedule.status === "InProgress"),
        ),
        asset.id,
      ).toBe(true);
    }
  });

  it("demonstrates quarantine as a distinct wire-plant condition", () => {
    expect(
      wirePlantMaintenanceScenario.data.assets.some(
        (asset) => asset.operationalCondition === "Quarantine",
      ),
    ).toBe(true);
  });

  it("fails fast when a build requests an unknown scenario", () => {
    expect(() => resolveDemoScenario("missing-scenario")).toThrow(
      "Unknown demo scenario: missing-scenario",
    );
  });

  it("registers an isolated ATM field-service scenario", () => {
    const scenario = resolveDemoScenario("atm-field-service");
    const corrective = scenario.data.serviceRequests.find(
      (request) => request.classification.serviceType === "Correctivo",
    );
    const preventive = scenario.data.serviceRequests.find(
      (request) => request.classification.serviceType === "Preventivo",
    );

    expect(scenario).toBe(atmFieldServiceScenario);
    expect(scenario.capabilityProfile).toBe("execution-only");
    expect(scenario.capabilities).toContain("service-request-intake");
    expect(scenario.capabilities).not.toContain("improvement-insights");
    expect(scenario.capabilities).not.toContain("executive-analytics");
    expect(scenario.persistence.stateKey).not.toBe(industrialBaseScenario.persistence.stateKey);
    expect(scenario.persistence.stateKey).toBe("zellship-maintenance-os-atm-v3");
    expect(scenario.distribution).toEqual({
      classification: "public-demo",
      containsClientIdentifiableData: false,
    });
    expect(corrective).toMatchObject({
      requiresAcceptance: true,
      acceptancePolicy: { durationHours: 24 },
      classification: {
        installationClass: "REMOTO",
        accessContext: "Comercio",
      },
    });
    expect(preventive).toMatchObject({ requiresAcceptance: false, status: "Planned" });
  });

  it("keeps ATM acceptance and access dimensions internally consistent", () => {
    const scenario = resolveDemoScenario("atm-field-service");
    const corrective = scenario.data.serviceRequests.filter(
      (request) => request.classification.serviceType === "Correctivo",
    );
    const preventive = scenario.data.serviceRequests.filter(
      (request) => request.classification.serviceType === "Preventivo",
    );
    const accessContexts = new Set(
      scenario.data.serviceRequests.map((request) => request.classification.accessContext),
    );

    expect(corrective.every((request) => request.requiresAcceptance)).toBe(true);
    expect(corrective.every((request) => request.acceptancePolicy?.durationHours === 24)).toBe(
      true,
    );
    expect(preventive.every((request) => !request.requiresAcceptance)).toBe(true);
    expect(accessContexts).toEqual(new Set(["Banco", "Comercio", "Torre residencial", "Mall"]));
    expect(
      scenario.data.serviceRequests.every((request) => {
        const protocol = scenario.data.protocols.find(
          (candidate) => candidate.id === request.protocolId,
        );
        return protocol?.assetIds?.includes(request.assetId);
      }),
    ).toBe(true);
  });

  it("registers the neutral wire-plant maintenance scenario", () => {
    const scenario = resolveDemoScenario("wire-plant-maintenance");

    expect(scenario).toBe(wirePlantMaintenanceScenario);
    expect(scenario.capabilityProfile).toBe("industrial-maintenance");
    expect(scenario.capabilities).toContain("asset-management");
    expect(scenario.capabilities).toContain("mobile-execution");
    expect(scenario.capabilities).not.toContain("service-request-intake");
    expect(scenario.capabilities).not.toContain("improvement-insights");
    expect(scenario.capabilities).not.toContain("executive-analytics");
    expect(scenario.data.assets).toHaveLength(26);
    expect(scenario.data.people).toHaveLength(11);
    expect(scenario.data.serviceRequests).toHaveLength(0);
    expect(scenario.persistence.stateKey).toBe("zellship-maintenance-os-wire-plant-v2");
    expect(scenario.distribution).toEqual({
      classification: "public-demo",
      containsClientIdentifiableData: false,
    });
  });

  it("registers an isolated retail store-operations scenario", () => {
    const scenario = resolveDemoScenario("retail-store-operations");

    expect(scenario).toBe(retailStoreOperationsScenario);
    expect(scenario.capabilityProfile).toBe("retail-store-support");
    expect(scenario.capabilities).toContain("store-operations");
    expect(scenario.capabilities).toContain("support-case-management");
    expect(scenario.capabilities).not.toContain("work-orders");
    expect(scenario.data.taxonomy.plants).toHaveLength(6);
    expect(scenario.data.storeAssignments?.length).toBeGreaterThan(0);
    expect(scenario.data.supportCases?.some((item) => item.sourceProtocolId)).toBe(true);
    expect(scenario.persistence.stateKey).toBe("zellship-store-operations-retail-v2");
    expect(scenario.distribution).toEqual({
      classification: "public-demo",
      containsClientIdentifiableData: false,
    });
  });
});

describe("capability profiles", () => {
  it("keeps Improvement and Executive outside the execution-only profile", () => {
    expect(capabilityProfiles.full).toContain("improvement-insights");
    expect(capabilityProfiles.full).toContain("executive-analytics");
    expect(capabilityProfiles["execution-only"]).not.toContain("improvement-insights");
    expect(capabilityProfiles["execution-only"]).not.toContain("executive-analytics");
  });

  it("keeps client intake and executive analytics outside industrial maintenance", () => {
    expect(capabilityProfiles["industrial-maintenance"]).not.toContain("service-request-intake");
    expect(capabilityProfiles["industrial-maintenance"]).not.toContain("improvement-insights");
    expect(capabilityProfiles["industrial-maintenance"]).not.toContain("executive-analytics");
  });

  it("keeps maintenance work orders outside retail store support", () => {
    expect(capabilityProfiles["retail-store-support"]).toContain("store-operations");
    expect(capabilityProfiles["retail-store-support"]).toContain("support-case-management");
    expect(capabilityProfiles["retail-store-support"]).not.toContain("work-orders");
    expect(capabilityProfiles["retail-store-support"]).not.toContain("maintenance-results");
  });
});

describe("scenario governance", () => {
  it("rejects client-identifiable data in a public demo", () => {
    const { data: _data, ...descriptor } = industrialBaseScenario;
    const result = demoScenarioDescriptorSchema.safeParse({
      ...descriptor,
      distribution: {
        classification: "public-demo",
        containsClientIdentifiableData: true,
      },
    });

    expect(result.success).toBe(false);
  });

  it("rejects capabilities that contradict the declared profile", () => {
    const { data: _data, ...descriptor } = industrialBaseScenario;
    const result = demoScenarioDescriptorSchema.safeParse({
      ...descriptor,
      capabilityProfile: "execution-only",
    });

    expect(result.success).toBe(false);
  });

  it("rejects duplicate capabilities", () => {
    const { data: _data, ...descriptor } = industrialBaseScenario;
    const result = demoScenarioDescriptorSchema.safeParse({
      ...descriptor,
      capabilities: [...descriptor.capabilities, descriptor.capabilities[0]],
    });

    expect(result.success).toBe(false);
  });

  it("can freeze the demo clock without changing the scenario data", () => {
    expect(resolveDemoNow("2026-08-14T09:30:00-06:00").toISOString()).toBe(
      "2026-08-14T15:30:00.000Z",
    );
  });

  it("fails fast when the frozen demo date is invalid", () => {
    expect(() => resolveDemoNow("not-a-date")).toThrow("Invalid VITE_DEMO_DATE");
  });
});
