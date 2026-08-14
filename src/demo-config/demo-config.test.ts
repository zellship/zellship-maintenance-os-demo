import { describe, expect, it } from "vitest";
import { capabilityProfiles } from "./capabilities";
import { resolveDemoNow } from "./clock";
import { resolveDemoScenario } from "./registry";
import { demoScenarioDescriptorSchema } from "./schema";
import { industrialBaseScenario } from "./scenarios/industrial-base/config";

describe("demo scenario registry", () => {
  it("preserves the audited industrial baseline contract", () => {
    const scenario = resolveDemoScenario("industrial-base");

    expect(scenario.id).toBe("industrial-base");
    expect(scenario.version).toBe("1.0.0");
    expect(scenario.sourceBaseline).toBe("f12b7c85ee7ba20ca9df4168c66f4a9765abcccb");
    expect(scenario.persistence.stateKey).toBe("zellship-maintenance-os-v4");
    expect(scenario.data.assets).toHaveLength(4);
    expect(scenario.data.protocols).toHaveLength(4);
    expect(scenario.data.schedules).toHaveLength(7);
  });

  it("fails fast when a build requests an unknown scenario", () => {
    expect(() => resolveDemoScenario("missing-scenario")).toThrow(
      "Unknown demo scenario: missing-scenario",
    );
  });
});

describe("capability profiles", () => {
  it("keeps Improvement and Executive outside the execution-only profile", () => {
    expect(capabilityProfiles.full).toContain("improvement-insights");
    expect(capabilityProfiles.full).toContain("executive-analytics");
    expect(capabilityProfiles["execution-only"]).not.toContain("improvement-insights");
    expect(capabilityProfiles["execution-only"]).not.toContain("executive-analytics");
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
