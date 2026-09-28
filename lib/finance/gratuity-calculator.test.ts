import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  STATUTORY_RATE_DAYS,
  calculateGratuity,
  gratuityFormulaAmount,
  isEligible,
  qualifyingServiceYears,
  totalServiceMonths,
} from "./gratuity-calculator";
import { gratuityCalculatorTool } from "../../config/tools/gratuity-calculator.config";

const approx = (actual: number, expected: number, eps = 0.01) =>
  assert.ok(Math.abs(actual - expected) < eps, `expected ~${expected}, got ${actual}`);

const BASE = {
  monthlyWage: 50000,
  completedYears: 5,
  additionalMonths: 0,
  employeeType: "regular" as const,
  useContractualRate: false,
  contractualRateDays: 15,
};

describe("50k wage, 5 years", () => {
  it("50000 / 26 x 15 x 5", () => {
    const r = calculateGratuity(BASE);
    assert.equal(r.qualifyingYears, 5);
    assert.equal(r.eligible, true);
    approx(r.dailyBasis, 1923.0769);
    approx(r.gratuityAmount, 144230.7692);
  });
});

describe("5 years 6 months does NOT round up", () => {
  it("qualifying years stay at 5", () => {
    assert.equal(qualifyingServiceYears(5, 6), 5);
    const r = calculateGratuity({ ...BASE, additionalMonths: 6 });
    assert.equal(r.qualifyingYears, 5);
    approx(r.gratuityAmount, 144230.7692);
  });
});

describe("5 years 7 months rounds to 6", () => {
  it("qualifying years become 6", () => {
    assert.equal(qualifyingServiceYears(5, 7), 6);
    const r = calculateGratuity({ ...BASE, additionalMonths: 7 });
    assert.equal(r.qualifyingYears, 6);
    approx(r.gratuityAmount, 173076.9231);
  });
});

describe("4 years 6 months vs 4 years 7 months", () => {
  it("4y6m -> 4 years, 4y7m -> 5 years", () => {
    assert.equal(qualifyingServiceYears(4, 6), 4);
    assert.equal(qualifyingServiceYears(4, 7), 5);
  });
});

describe("50k wage, 10 years", () => {
  it("normal calculation", () => {
    const r = calculateGratuity({ ...BASE, completedYears: 10 });
    assert.equal(r.qualifyingYears, 10);
    assert.equal(r.eligible, true);
    approx(r.gratuityAmount, 288461.5385);
  });
});

describe("regular employee below 5 years", () => {
  it("standard eligibility status must not say eligible", () => {
    const r = calculateGratuity({ ...BASE, completedYears: 3 });
    assert.equal(r.eligible, false);
    // Formula amount still computed as secondary disclosure.
    approx(r.gratuityAmount, 86538.4615);
  });
  it("4 years 11 months is still below the 5-year assumption", () => {
    assert.equal(isEligible("regular", totalServiceMonths(4, 11)), false);
  });
});

describe("fixed-term employees", () => {
  it("exactly 1 year is eligible under the contract assumption", () => {
    const r = calculateGratuity({ ...BASE, completedYears: 1, employeeType: "fixed-term" });
    assert.equal(r.eligible, true);
    assert.equal(r.qualifyingYears, 1);
    approx(r.gratuityAmount, 28846.1538);
  });
  it("below 1 year is not eligible", () => {
    const r = calculateGratuity({
      ...BASE,
      completedYears: 0,
      additionalMonths: 11,
      employeeType: "fixed-term",
    });
    assert.equal(r.eligible, false);
  });
  it("above 1 year stays eligible without a 5-year gate", () => {
    const r = calculateGratuity({ ...BASE, completedYears: 2, employeeType: "fixed-term" });
    assert.equal(r.eligible, true);
    assert.equal(r.qualifyingYears, 2);
  });
});

describe("contractual rate", () => {
  it("higher rate applies only when explicitly selected", () => {
    const statutory = calculateGratuity({ ...BASE, contractualRateDays: 20, useContractualRate: false });
    assert.equal(statutory.rateSource, "statutory");
    assert.equal(statutory.rateDays, 15);
    const contractual = calculateGratuity({ ...BASE, contractualRateDays: 20, useContractualRate: true });
    assert.equal(contractual.rateSource, "contractual");
    assert.equal(contractual.rateDays, 20);
    approx(contractual.gratuityAmount, 192307.6923);
  });
  it("contractual rate of 15 matches the statutory result", () => {
    const a = calculateGratuity({ ...BASE, useContractualRate: true, contractualRateDays: 15 });
    const b = calculateGratuity(BASE);
    assert.equal(a.gratuityAmount, b.gratuityAmount);
  });
});

describe("7 years 8 months example", () => {
  it("qualifying 8 years", () => {
    const r = calculateGratuity({ ...BASE, completedYears: 7, additionalMonths: 8 });
    assert.equal(r.qualifyingYears, 8);
    approx(r.gratuityAmount, 230769.2308);
  });
});

describe("validation at the schema boundary", () => {
  const valid = {
    monthlyWage: 50000,
    completedYears: 5,
    additionalMonths: 0,
    employeeType: "regular" as const,
    useContractualRate: false,
    contractualRateDays: 15,
  };
  it("accepts the valid example input", () => {
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse(valid).success, true);
  });
  it("rejects zero wage", () => {
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse({ ...valid, monthlyWage: 0 }).success, false);
  });
  it("rejects negative wage", () => {
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse({ ...valid, monthlyWage: -100 }).success, false);
  });
  it("rejects invalid months", () => {
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse({ ...valid, additionalMonths: 12 }).success, false);
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse({ ...valid, additionalMonths: -1 }).success, false);
  });
  it("rejects invalid employee type", () => {
    assert.equal(gratuityCalculatorTool.inputSchema.safeParse({ ...valid, employeeType: "intern" }).success, false);
  });
  it("rejects invalid contractual rate", () => {
    assert.equal(
      gratuityCalculatorTool.inputSchema.safeParse({ ...valid, useContractualRate: true, contractualRateDays: 0 }).success,
      false
    );
  });
});

describe("non-finite and extreme inputs", () => {
  it("NaN yields finite zeroed outputs", () => {
    const r = calculateGratuity({
      monthlyWage: NaN,
      completedYears: NaN,
      additionalMonths: NaN,
      employeeType: "regular",
      useContractualRate: false,
      contractualRateDays: NaN,
    });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v), `expected finite, got ${v}`);
    }
    assert.equal(r.gratuityAmount, 0);
  });
  it("Infinity stays bounded", () => {
    const r = calculateGratuity({ ...BASE, monthlyWage: Number.POSITIVE_INFINITY });
    assert.ok(Number.isFinite(r.gratuityAmount));
    assert.ok(Number.isFinite(r.dailyBasis));
  });
  it("very large values remain finite", () => {
    const r = calculateGratuity({ ...BASE, monthlyWage: 1e12, completedYears: 1e6 });
    for (const v of Object.values(r)) {
      if (typeof v === "number") assert.ok(Number.isFinite(v));
    }
  });
});

describe("precision and engine independence", () => {
  it("formula helper matches the end-to-end result", () => {
    assert.equal(gratuityFormulaAmount(50000, 15, 5), calculateGratuity(BASE).gratuityAmount);
  });
  it("display rounding does not alter the engine result", () => {
    const r = calculateGratuity(BASE);
    assert.ok(r.gratuityAmount > 144230 && r.gratuityAmount < 144231);
  });
  it("statutory rate constant is 15 days", () => {
    assert.equal(STATUTORY_RATE_DAYS, 15);
  });
});
