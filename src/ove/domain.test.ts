import { describe, expect, it } from "vitest";
import { isConsumptionDeviation, isFormValid } from "./domain";
import type { FormField, MaterialAllocation } from "./types";

describe("isConsumptionDeviation", () => {
  it("accepts an exact consumption when it matches the configured quantity", () => {
    const allocation: MaterialAllocation = {
      inventoryItemId: "oil",
      mode: "Exact",
      quantity: 2,
      reservedQuantity: 2,
      actualQuantity: 2,
    };

    expect(isConsumptionDeviation(allocation)).toBe(false);
  });

  it("flags values outside a configured range", () => {
    const allocation: MaterialAllocation = {
      inventoryItemId: "coolant",
      mode: "Range",
      min: 3,
      max: 5,
      reservedQuantity: 4,
      actualQuantity: 6,
    };

    expect(isConsumptionDeviation(allocation)).toBe(true);
  });
});

describe("isFormValid", () => {
  const fields: FormField[] = [
    { id: "temperature", type: "number", label: "Temperatura", required: true },
    { id: "comment", type: "comment", label: "Comentario" },
  ];

  it("requires values only for required fields", () => {
    expect(isFormValid(fields, { temperature: 82 })).toBe(true);
    expect(isFormValid(fields, { temperature: "" })).toBe(false);
  });
});
