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
  "service-request-intake",
  "store-operations",
  "support-case-management",
  "improvement-insights",
  "executive-analytics",
] as const;

export type DemoCapabilityId = (typeof capabilityIds)[number];

const executionOnlyExclusions = new Set<DemoCapabilityId>([
  "improvement-insights",
  "executive-analytics",
]);

const industrialMaintenanceExclusions = new Set<DemoCapabilityId>([
  "service-request-intake",
  "improvement-insights",
  "executive-analytics",
]);

const retailStoreSupportCapabilities = new Set<DemoCapabilityId>([
  "admin-control-center",
  "protocol-management",
  "asset-management",
  "resource-management",
  "incident-management",
  "notifications",
  "audit-log",
  "operational-flows",
  "mobile-execution",
  "supervisor-alerts",
  "supervisor-validation",
  "store-operations",
  "support-case-management",
]);

export const capabilityProfiles = {
  full: [...capabilityIds],
  "execution-only": capabilityIds.filter((id) => !executionOnlyExclusions.has(id)),
  "industrial-maintenance": capabilityIds.filter((id) => !industrialMaintenanceExclusions.has(id)),
  "retail-store-support": capabilityIds.filter((id) => retailStoreSupportCapabilities.has(id)),
} satisfies Record<string, DemoCapabilityId[]>;

export type CapabilityProfileId = keyof typeof capabilityProfiles;

export function hasCapability(
  capabilities: readonly DemoCapabilityId[],
  capability: DemoCapabilityId,
) {
  return capabilities.includes(capability);
}
