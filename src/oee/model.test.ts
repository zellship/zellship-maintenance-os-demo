import { describe, expect, it } from "vitest";
import {
  advanceDemoStage,
  demoStages,
  initialDemoStage,
  isDemoStageId,
  stateSequence,
} from "./model";

describe("OEE demo state machine", () => {
  it("follows the canonical state sequence exactly", () => {
    expect(stateSequence()).toEqual([
      "Programada",
      "Asignada",
      "Preparada",
      "En ejecución",
      "Pendiente de validación",
      "Corrección requerida",
      "En corrección",
      "Pendiente de validación",
      "Cerrada",
    ]);
  });

  it("advances deterministically and stops at the summary", () => {
    let stage = initialDemoStage;
    const visited = [stage];

    for (let index = 1; index < demoStages.length; index += 1) {
      stage = advanceDemoStage(stage);
      visited.push(stage);
    }

    expect(visited).toEqual(demoStages.map((item) => item.id));
    expect(advanceDemoStage(stage)).toBe("summary");
  });

  it("rejects incompatible persisted state", () => {
    expect(isDemoStageId("review-one")).toBe(true);
    expect(isDemoStageId("retail-demo-state")).toBe(false);
    expect(isDemoStageId(null)).toBe(false);
  });
});
