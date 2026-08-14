import dayjs, { type Dayjs } from "dayjs";

export function resolveDemoNow(fixedDateTime?: string): Dayjs {
  if (!fixedDateTime) return dayjs();

  const resolved = dayjs(fixedDateTime);
  if (!resolved.isValid()) {
    throw new Error(`Invalid VITE_DEMO_DATE: ${fixedDateTime}`);
  }

  return resolved;
}

export function demoNow(): Dayjs {
  return resolveDemoNow(import.meta.env.VITE_DEMO_DATE);
}
