import dayjs, { type Dayjs } from "dayjs";

let logicalNow: Dayjs | null = null;

const clockStorageKey = `zellship-maintenance-demo-clock-${import.meta.env.VITE_DEMO_SCENARIO ?? "industrial-base"}`;

function initialScenarioNow(fixedDateTime?: string) {
  if (fixedDateTime) return dayjs(fixedDateTime);
  return dayjs().hour(9).minute(30).second(0).millisecond(0);
}

function persistedLogicalNow() {
  if (typeof window === "undefined") return null;
  const persisted = window.sessionStorage.getItem(clockStorageKey);
  if (!persisted) return null;
  const resolved = dayjs(persisted);
  return resolved.isValid() ? resolved : null;
}

function persistLogicalNow(value: Dayjs) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(clockStorageKey, value.toISOString());
}

export function resolveDemoNow(fixedDateTime?: string): Dayjs {
  const resolved = initialScenarioNow(fixedDateTime);
  if (!resolved.isValid()) {
    throw new Error(`Invalid VITE_DEMO_DATE: ${fixedDateTime}`);
  }

  return resolved;
}

export function demoNow(): Dayjs {
  const base = resolveDemoNow(import.meta.env.VITE_DEMO_DATE);
  const persisted = persistedLogicalNow();
  const candidate = logicalNow ?? persisted;
  if (!candidate || candidate.isBefore(base)) return base;
  logicalNow = candidate;
  return candidate;
}

export function advanceDemoClock(minutes = 1): Dayjs {
  const next = demoNow().add(Math.max(1, minutes), "minute");
  logicalNow = next;
  persistLogicalNow(next);
  return next;
}

export function resetDemoClock() {
  logicalNow = null;
  if (typeof window !== "undefined") window.sessionStorage.removeItem(clockStorageKey);
}
