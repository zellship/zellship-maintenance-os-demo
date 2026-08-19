import dayjs from "dayjs";
import { describe, expect, it } from "vitest";
import { resolveDemoNow } from "./clock";
import { industrialBaseScenario } from "./scenarios/industrial-base/config";
import { atmFieldServiceScenario } from "./scenarios/atm-field-service/config";
import { wirePlantMaintenanceScenario } from "./scenarios/wire-plant-maintenance/config";
import { retailStoreOperationsScenario } from "./scenarios/retail-store-operations/config";

const scenarios = [
  industrialBaseScenario,
  atmFieldServiceScenario,
  wirePlantMaintenanceScenario,
  retailStoreOperationsScenario,
];

describe.each(scenarios)("$id temporal integrity", (scenario) => {
  const { data } = scenario;

  it("keeps execution events in chronological order", () => {
    for (const execution of data.executions) {
      const startedAt = dayjs(execution.startAt);
      const completedAt = dayjs(execution.endAt ?? execution.startAt);

      expect(completedAt.isBefore(startedAt), execution.id).toBe(false);
      expect(completedAt.isAfter(resolveDemoNow()), execution.id).toBe(false);

      for (const evidence of execution.evidences) {
        const capturedAt = dayjs(evidence.timestamp);
        expect(capturedAt.isBefore(startedAt), evidence.id).toBe(false);
        expect(capturedAt.isAfter(completedAt), evidence.id).toBe(false);
      }

      if (execution.approval) {
        expect(dayjs(execution.approval.at).isBefore(completedAt), execution.id).toBe(false);
      }

      if (execution.resourceCheckInAt) {
        const checkedInAt = dayjs(execution.resourceCheckInAt);
        expect(checkedInAt.isBefore(startedAt), execution.id).toBe(false);
        expect(checkedInAt.isAfter(completedAt), execution.id).toBe(false);
      }

      if (execution.reopenedAt) {
        expect(dayjs(execution.reopenedAt).isBefore(completedAt), execution.id).toBe(false);
        expect(dayjs(execution.reopenedAt).isAfter(resolveDemoNow()), execution.id).toBe(false);
      }
    }
  });

  it("keeps completed schedules connected to executions", () => {
    const executedScheduleIds = new Set(data.executions.map((execution) => execution.scheduleId));
    for (const schedule of data.schedules.filter((item) => item.status === "Completed")) {
      expect(executedScheduleIds.has(schedule.id), schedule.id).toBe(true);
    }
  });

  it("does not leave overdue schedules as ordinary pending work", () => {
    const now = resolveDemoNow();
    for (const schedule of data.schedules.filter((item) => item.status === "Pending")) {
      const toleranceEnd = dayjs(`${schedule.date} ${schedule.hour}`).add(
        schedule.tolerance,
        "minute",
      );
      expect(toleranceEnd.isBefore(now), schedule.id).toBe(false);
    }
  });

  it("keeps reservations aligned to their scheduled start", () => {
    for (const reservation of data.reservations) {
      const schedule = data.schedules.find((item) => item.id === reservation.scheduleId);
      expect(schedule, reservation.id).toBeDefined();
      if (!schedule) continue;
      expect(dayjs(reservation.startAt).isSame(dayjs(`${schedule.date} ${schedule.hour}`))).toBe(
        true,
      );
      expect(dayjs(reservation.endAt).isAfter(dayjs(reservation.startAt)), reservation.id).toBe(
        true,
      );
    }
  });

  it("keeps accepted service requests inside their acceptance window", () => {
    const now = resolveDemoNow();
    for (const request of data.serviceRequests) {
      const receivedAt = dayjs(request.receivedAt);
      expect(receivedAt.isAfter(now), request.id).toBe(false);
      if (request.acceptanceDueAt) {
        expect(dayjs(request.acceptanceDueAt).isBefore(receivedAt), request.id).toBe(false);
      }
      if (!request.acceptedAt) continue;

      const acceptedAt = dayjs(request.acceptedAt);
      expect(acceptedAt.isBefore(receivedAt), request.id).toBe(false);
      expect(acceptedAt.isAfter(now), request.id).toBe(false);
      if (request.acceptanceDueAt) {
        expect(acceptedAt.isAfter(dayjs(request.acceptanceDueAt)), request.id).toBe(false);
      }
    }
  });

  it("keeps incidents and notifications on a monotonic timeline", () => {
    const now = resolveDemoNow();

    for (const incident of data.incidents) {
      const createdAt = dayjs(incident.createdAt);
      expect(createdAt.isAfter(now), incident.id).toBe(false);

      let lastAt = createdAt;
      for (const update of incident.updates ?? []) {
        const updateAt = dayjs(update.at);
        expect(updateAt.isBefore(createdAt), `${incident.id}/${update.id}`).toBe(false);
        expect(updateAt.isBefore(lastAt), `${incident.id}/${update.id}`).toBe(false);
        expect(updateAt.isAfter(now), `${incident.id}/${update.id}`).toBe(false);
        lastAt = updateAt;
      }

      for (const attachment of incident.attachments ?? []) {
        const uploadedAt = dayjs(attachment.uploadedAt);
        expect(uploadedAt.isBefore(createdAt), `${incident.id}/${attachment.id}`).toBe(false);
        expect(uploadedAt.isAfter(now), `${incident.id}/${attachment.id}`).toBe(false);
      }

      if (incident.resolvedAt) {
        expect(dayjs(incident.resolvedAt).isBefore(createdAt), incident.id).toBe(false);
      }
      if (incident.closedAt) {
        const resolvedAt = dayjs(incident.resolvedAt ?? incident.createdAt);
        expect(dayjs(incident.closedAt).isBefore(resolvedAt), incident.id).toBe(false);
      }
    }

    for (const notification of data.notifications) {
      expect(dayjs(notification.createdAt).isAfter(now), notification.id).toBe(false);
    }
  });

  it("keeps document metadata attached to valid entities and out of the future", () => {
    const now = resolveDemoNow();
    const assetIds = new Set(data.assets.map((asset) => asset.id));
    const personIds = new Set(data.people.map((person) => person.id));
    const toolIds = new Set(data.tools.map((tool) => tool.id));

    for (const document of data.documents) {
      const validEntity =
        (document.entityType === "Asset" && assetIds.has(document.entityId)) ||
        (document.entityType === "Person" && personIds.has(document.entityId)) ||
        (document.entityType === "Tool" && toolIds.has(document.entityId));
      expect(validEntity, document.id).toBe(true);
      expect(dayjs(document.issuedAt).isAfter(dayjs(document.uploadedAt)), document.id).toBe(false);
      expect(dayjs(document.uploadedAt).isAfter(now), document.id).toBe(false);
      if (document.expiresAt) {
        expect(dayjs(document.expiresAt).isBefore(dayjs(document.issuedAt)), document.id).toBe(
          false,
        );
      }
    }
  });
});
