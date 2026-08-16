import { describe, expect, it } from "vitest";
import { wirePlantMaintenanceScenario } from "./config";

const { data } = wirePlantMaintenanceScenario;

describe("wire plant maintenance walkthrough", () => {
  it("preserves the supplied inventory structure", () => {
    const areas = new Map<string, number>();
    data.assets.forEach((asset) => areas.set(asset.area, (areas.get(asset.area) ?? 0) + 1));

    expect(data.assets).toHaveLength(26);
    expect(areas).toEqual(
      new Map([
        ["Laminado", 2],
        ["Trefilado para Recocido y Clavo", 3],
        ["Clavo", 5],
        ["Recocido", 2],
        ["Electrosoldado", 2],
        ["Varilla 6000", 1],
        ["Servicios Generales", 11],
      ]),
    );
  });

  it("keeps the eleven-person maintenance team available", () => {
    expect(data.people).toHaveLength(11);
    expect(data.people.filter((person) => person.role === "Supervisor")).toHaveLength(1);
    expect(data.people.filter((person) => person.role === "Technician")).toHaveLength(10);
  });

  it("anchors the main story on Trefiladora 3", () => {
    const asset = data.assets.find((candidate) => candidate.id === "TRF-03");
    const protocol = data.protocols.find((candidate) => candidate.id === "p-wire-condition");
    const schedule = data.schedules.find((candidate) => candidate.id === "s-wire-main");
    const incident = data.incidents.find((candidate) => candidate.id === "inc-wire-condition");

    expect(asset).toMatchObject({ status: "Risk", criticality: "Critical" });
    expect(protocol?.assetIds).toEqual(["TRF-03"]);
    expect(protocol?.requiresValidation).toBe(true);
    expect(schedule).toMatchObject({
      assetId: "TRF-03",
      operator: "Eduardo Morales",
      status: "Pending",
    });
    expect(incident?.description).toContain("Escenario demostrativo");
  });

  it("uses three photo phases without GPS or automated AI claims", () => {
    const protocol = data.protocols.find((candidate) => candidate.id === "p-wire-condition");
    const photos = protocol?.evidenceConfig.filter((evidence) => evidence.type === "Photo") ?? [];

    expect(protocol?.evidenceConfig.some((evidence) => evidence.type === "GPS")).toBe(false);
    expect(photos.map((photo) => photo.phase)).toEqual([
      "Pre-intervention",
      "Intervention",
      "Post-intervention",
    ]);
    expect(photos.every((photo) => photo.aiValidation === false)).toBe(true);
  });

  it("keeps every schedule connected to a known protocol, asset, and operator", () => {
    const protocolIds = new Set(data.protocols.map((protocol) => protocol.id));
    const assetIds = new Set(data.assets.map((asset) => asset.id));
    const operatorNames = new Set(data.people.map((person) => person.name));

    expect(
      data.schedules.every(
        (schedule) =>
          protocolIds.has(schedule.protocolId) &&
          Boolean(schedule.assetId && assetIds.has(schedule.assetId)) &&
          operatorNames.has(schedule.operator),
      ),
    ).toBe(true);
  });
});
