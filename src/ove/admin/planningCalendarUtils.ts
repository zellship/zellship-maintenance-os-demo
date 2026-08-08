import dayjs, { type Dayjs } from "dayjs";
import type { ScheduleStatus } from "../types";

export type PlanningView = "day" | "week" | "month" | "list";

export const PLANNING_MONTH_NAMES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

export function getPlanningRange(view: PlanningView, anchorDate: Dayjs) {
  if (view === "day") return { start: anchorDate.startOf("day"), end: anchorDate.endOf("day") };
  if (view === "month") {
    return { start: anchorDate.startOf("month"), end: anchorDate.endOf("month") };
  }
  if (view === "list") return null;
  const start = startOfOperationalWeek(anchorDate);
  return { start, end: start.add(6, "day").endOf("day") };
}

export function getPlanningPeriodLabel(view: PlanningView, anchorDate: Dayjs) {
  if (view === "day") {
    return `${anchorDate.format("DD")} de ${PLANNING_MONTH_NAMES[anchorDate.month()]} de ${anchorDate.format("YYYY")}`;
  }
  if (view === "month") {
    return `${PLANNING_MONTH_NAMES[anchorDate.month()]} ${anchorDate.format("YYYY")}`;
  }
  if (view === "list") return "Todas las órdenes programadas";
  const start = startOfOperationalWeek(anchorDate);
  const end = start.add(6, "day");
  return `${start.format("DD MMM")} – ${end.format("DD MMM YYYY")}`;
}

export function getStatusPlanningLabel(status: ScheduleStatus) {
  return (
    {
      Pending: "Confirmada",
      InProgress: "En ejecución",
      Completed: "Completada",
      Expired: "Vencida",
      Cancelled: "Cancelada",
    } as const
  )[status];
}

function startOfOperationalWeek(date: Dayjs) {
  return date.subtract((date.day() + 6) % 7, "day").startOf("day");
}
