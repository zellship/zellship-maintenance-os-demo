import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import { getPlanningPeriodLabel, getPlanningRange } from "./planningCalendarUtils";

describe("planning calendar periods", () => {
  it("uses an operational week from Monday through Sunday", () => {
    const range = getPlanningRange("week", dayjs("2026-08-07"));

    expect(range?.start.format("YYYY-MM-DD")).toBe("2026-08-03");
    expect(range?.end.format("YYYY-MM-DD")).toBe("2026-08-09");
    expect(getPlanningPeriodLabel("week", dayjs("2026-08-07"))).toBe("03 Aug – 09 Aug 2026");
  });

  it("returns the full selected month", () => {
    const range = getPlanningRange("month", dayjs("2026-08-07"));

    expect(range?.start.format("YYYY-MM-DD")).toBe("2026-08-01");
    expect(range?.end.format("YYYY-MM-DD")).toBe("2026-08-31");
    expect(getPlanningPeriodLabel("month", dayjs("2026-08-07"))).toBe("agosto 2026");
  });
});
