import type { FormField, MaterialAllocation } from "./types";

export function isFormValid(fields: FormField[], values: Record<string, unknown>) {
  return fields
    .filter((field) => field.required && field.type !== "separator")
    .every((field) => {
      const value = values[field.id];
      return value !== undefined && value !== null && value !== "";
    });
}

export function isConsumptionDeviation(allocation: MaterialAllocation) {
  const actual = allocation.actualQuantity ?? 0;

  if (allocation.mode === "Exact") return actual !== (allocation.quantity ?? 0);
  if (allocation.min !== undefined && actual < allocation.min) return true;
  if (allocation.max !== undefined && actual > allocation.max) return true;

  return false;
}
