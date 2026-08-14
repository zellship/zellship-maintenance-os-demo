export const capabilityIds = [
  "admin-control-center",
  "protocol-management",
  "planning",
  "work-orders",
  "maintenance-results",
  "asset-management",
  "resource-management",
  "incident-management",
  "notifications",
  "audit-log",
  "operational-flows",
  "mobile-execution",
  "supervisor-alerts",
  "supervisor-validation",
  "improvement-insights",
  "executive-analytics",
] as const;

export type DemoCapabilityId = (typeof capabilityIds)[number];

const executionOnlyExclusions = new Set<DemoCapabilityId>([
  "improvement-insights",
  "executive-analytics",
]);

export const capabilityProfiles = {
  full: [...capabilityIds],
  "execution-only": capabilityIds.filter((id) => !executionOnlyExclusions.has(id)),
} satisfies Record<string, DemoCapabilityId[]>;

export type CapabilityProfileId = keyof typeof capabilityProfiles;

export function hasCapability(
  capabilities: readonly DemoCapabilityId[],
  capability: DemoCapabilityId,
) {
  return capabilities.includes(capability);
}
