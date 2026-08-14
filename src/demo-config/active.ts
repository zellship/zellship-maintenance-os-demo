import { hasCapability as includesCapability, type DemoCapabilityId } from "./capabilities";
import { resolveDemoScenario } from "./registry";

export const activeDemo = resolveDemoScenario(import.meta.env.VITE_DEMO_SCENARIO);
export const demoData = activeDemo.data;

export function hasCapability(capability: DemoCapabilityId) {
  return includesCapability(activeDemo.capabilities, capability);
}
