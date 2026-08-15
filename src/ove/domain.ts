import dayjs from "dayjs";
import type {
  Execution,
  FormField,
  MaterialAllocation,
  Notification,
  Role,
  Schedule,
  ServiceClassification,
  ServiceRequest,
} from "./types";

export function resolveValidationExecutionId(
  event: Notification,
  schedules: Schedule[],
  executions: Execution[],
) {
  if (event.type !== "ValidationRequired") return null;
  const workOrder = event.message.match(/\bOT-[A-Z0-9-]+\b/)?.[0];
  const schedule = workOrder
    ? schedules.find((candidate) => candidate.workOrder === workOrder)
    : undefined;
  return (
    executions.find(
      (candidate) =>
        candidate.scheduleId === schedule?.id && candidate.status === "PendingValidation",
    )?.id ?? null
  );
}

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

export function remainingAcceptanceSeconds(request: ServiceRequest, now: string) {
  if (!request.acceptanceDueAt) return null;
  return Math.max(0, dayjs(request.acceptanceDueAt).diff(dayjs(now), "second"));
}

export function canAcceptServiceRequest(request: ServiceRequest, now: string) {
  if (!request.requiresAcceptance || request.status !== "Received") return false;
  const remaining = remainingAcceptanceSeconds(request, now);
  return remaining === null || remaining > 0;
}

export function acceptServiceRequest(
  request: ServiceRequest,
  classification: ServiceClassification,
  actor: string,
  acceptedAt: string,
): ServiceRequest {
  if (!canAcceptServiceRequest(request, acceptedAt)) {
    throw new Error(`Service request ${request.id} cannot be accepted`);
  }
  return {
    ...request,
    status: "Accepted",
    classification,
    acceptedAt,
    acceptedBy: actor,
  };
}

export function canApproveExecution(role: Role) {
  return role === "admin" || role === "supervisor";
}

export function canRejectExecution(role: Role) {
  return role === "supervisor";
}

export function canReopenExecution(role: Role) {
  return role === "admin" || role === "supervisor";
}
