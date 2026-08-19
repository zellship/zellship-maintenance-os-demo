import { industrialBaseScenario } from "./scenarios/industrial-base/config";
import { atmFieldServiceScenario } from "./scenarios/atm-field-service/config";
import { wirePlantMaintenanceScenario } from "./scenarios/wire-plant-maintenance/config";
import { retailStoreOperationsScenario } from "./scenarios/retail-store-operations/config";
import type { DemoScenario } from "./types";

export const demoScenarioRegistry = {
  "industrial-base": industrialBaseScenario,
  "atm-field-service": atmFieldServiceScenario,
  "wire-plant-maintenance": wirePlantMaintenanceScenario,
  "retail-store-operations": retailStoreOperationsScenario,
} satisfies Record<string, DemoScenario>;

export type DemoScenarioId = keyof typeof demoScenarioRegistry;

export function resolveDemoScenario(id: string | undefined): DemoScenario {
  const scenarioId = id || "industrial-base";
  const scenario = demoScenarioRegistry[scenarioId as DemoScenarioId];

  if (!scenario) {
    throw new Error(`Unknown demo scenario: ${scenarioId}`);
  }

  return scenario;
}
